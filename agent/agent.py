import configparser
import json
import os
import platform
import socket
import time
import uuid
from typing import Any

import psutil
import requests

AGENT_VERSION = "0.3.0"
DEFAULT_DEVICE_TYPE = "desktop"


def load_config():
    config_path = os.path.join(os.path.dirname(__file__), "config.ini")
    config = configparser.ConfigParser()
    config.read(config_path)

    endpoint = config.get("agent", "endpoint", fallback=None)
    api_key = config.get("agent", "api_key", fallback=None)
    agent_id = config.get("agent", "agent_id", fallback=None)
    device_type = config.get("agent", "device_type", fallback=DEFAULT_DEVICE_TYPE)

    endpoint = os.environ.get("PROC_ENDPOINT", endpoint)
    api_key = os.environ.get("PROC_API_KEY", api_key)
    agent_id = os.environ.get("PROC_AGENT_ID", agent_id)
    device_type = os.environ.get("PROC_DEVICE_TYPE", device_type)

    if not endpoint or not api_key:
        raise RuntimeError("Missing endpoint or api_key in config/env")

    if not agent_id:
        agent_id = uuid.uuid4().hex
        persist_config(config, config_path, {"agent_id": agent_id})

    return config, config_path, endpoint, api_key, agent_id, device_type


def persist_config(config, config_path, values: dict[str, str]):
    if not config.has_section("agent"):
        config.add_section("agent")
    for key, value in values.items():
        config.set("agent", key, value)
    with open(config_path, "w", encoding="utf-8") as config_file:
        config.write(config_file)


def get_primary_ip():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("8.8.8.8", 80))
        return sock.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        sock.close()


def get_load_averages():
    if not hasattr(os, "getloadavg"):
        return (None, None, None)
    try:
        one, five, fifteen = os.getloadavg()
        return (float(one), float(five), float(fifteen))
    except OSError:
        return (None, None, None)


def get_listening_ports(limit=20):
    try:
        connections = psutil.net_connections(kind="inet")
    except Exception:
        return []

    ports = {
        int(connection.laddr.port)
        for connection in connections
        if connection.status == psutil.CONN_LISTEN and connection.laddr
    }
    return sorted(ports)[:limit]


def collect_processes():
    for process in psutil.process_iter(attrs=["pid", "ppid", "name"]):
        try:
            process.cpu_percent(interval=None)
        except Exception:
            pass

    time.sleep(0.25)

    processes = []
    for process in psutil.process_iter(
        attrs=["pid", "ppid", "name", "memory_info", "username", "cmdline", "status"]
    ):
        try:
            info = process.info
            cpu_percent = process.cpu_percent(interval=0.05)
            memory_info = info.get("memory_info")
            cmdline = info.get("cmdline") or []
            processes.append(
                {
                    "pid": int(info["pid"]),
                    "ppid": int(info.get("ppid") or 0),
                    "name": str(info.get("name") or "unknown"),
                    "cpu_percent": float(cpu_percent) if cpu_percent is not None else None,
                    "memory_mb": (
                        float(memory_info.rss / (1024 * 1024)) if memory_info is not None else None
                    ),
                    "status": str(info.get("status") or ""),
                    "username": str(info.get("username") or ""),
                    "cmdline": " ".join(str(part) for part in cmdline if part),
                }
            )
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
        except Exception:
            continue

    return processes


def collect_snapshot_payload(agent_id: str, device_type: str) -> dict[str, Any]:
    virtual_memory = psutil.virtual_memory()
    disk_usage = psutil.disk_usage("/")
    network = psutil.net_io_counters()
    load_one, load_five, load_fifteen = get_load_averages()

    return {
        "agent_id": agent_id,
        "hostname": socket.gethostname(),
        "device_type": device_type,
        "agent_version": AGENT_VERSION,
        "os_name": platform.system(),
        "os_version": platform.release(),
        "architecture": platform.machine(),
        "primary_ip": get_primary_ip(),
        "cpu_count": psutil.cpu_count() or 0,
        "total_memory_mb": round(virtual_memory.total / (1024 * 1024), 2),
        "total_disk_gb": round(disk_usage.total / (1024 * 1024 * 1024), 2),
        "cpu_percent": psutil.cpu_percent(interval=0.2),
        "memory_percent": virtual_memory.percent,
        "disk_percent": disk_usage.percent,
        "network_sent_mb": round(network.bytes_sent / (1024 * 1024), 2),
        "network_recv_mb": round(network.bytes_recv / (1024 * 1024), 2),
        "load_one": load_one,
        "load_five": load_five,
        "load_fifteen": load_fifteen,
        "uptime_seconds": int(time.time() - psutil.boot_time()),
        "active_user_count": len(psutil.users()),
        "listening_ports": get_listening_ports(),
        "processes": collect_processes(),
    }


def post_snapshot(endpoint, api_key, payload):
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key,
    }
    response = requests.post(endpoint, headers=headers, data=json.dumps(payload), timeout=20)
    if response.status_code >= 300:
        raise RuntimeError(f"Server error {response.status_code}: {response.text}")
    return response.json()


def main():
    try:
        config, config_path, endpoint, api_key, agent_id, device_type = load_config()
        payload = collect_snapshot_payload(agent_id, device_type)
        result = post_snapshot(endpoint, api_key, payload)

        updates = {}
        issued_key = result.get("host_api_key")
        if issued_key and issued_key != api_key:
            updates["api_key"] = issued_key
        if updates:
            persist_config(config, config_path, updates)

        print(
            "Uploaded snapshot for "
            f"{payload['hostname']} ({payload['agent_id']}): "
            f"{result['total_processes']} processes"
        )
    except Exception as error:
        print(f"Agent error: {error}")


if __name__ == "__main__":
    main()
