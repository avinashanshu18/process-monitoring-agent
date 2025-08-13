import socket
import time
import psutil
import requests
import configparser
import os
import json

def load_config():
    cfg = configparser.ConfigParser()
    cfg.read(os.path.join(os.path.dirname(__file__), "config.ini"))
    endpoint = cfg.get("agent", "endpoint", fallback=None)
    api_key = cfg.get("agent", "api_key", fallback=None)
    # Allow ENV override
    endpoint = os.environ.get("PROC_ENDPOINT", endpoint)
    api_key = os.environ.get("PROC_API_KEY", api_key)
    if not endpoint or not api_key:
        raise RuntimeError("Missing endpoint or api_key in config/env")
    return endpoint, api_key

def collect_processes():
    # First call to cpu_percent initializes; second call gives a measured value
    for p in psutil.process_iter(attrs=["pid", "ppid", "name"]):
        try:
            p.cpu_percent(interval=None)
        except Exception:
            pass
    time.sleep(0.5)

    procs = []
    for p in psutil.process_iter(attrs=["pid", "ppid", "name", "memory_info"]):
        try:
            info = p.info
            cpu = p.cpu_percent(interval=0.2)
            mem = (info.get("memory_info").rss / (1024 * 1024)) if info.get("memory_info") else None
            procs.append({
                "pid": int(info["pid"]),
                "ppid": int(info.get("ppid") or 0),
                "name": str(info.get("name") or "unknown"),
                "cpu_percent": float(cpu) if cpu is not None else None,
                "memory_mb": float(mem) if mem is not None else None,
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
        except Exception:
            continue
    return procs

def post_snapshot(endpoint, api_key, hostname, processes):
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key,
    }
    payload = {"hostname": hostname, "processes": processes}
    resp = requests.post(endpoint, headers=headers, data=json.dumps(payload), timeout=15)
    if resp.status_code >= 300:
        raise RuntimeError(f"Server error {resp.status_code}: {resp.text}")
    return resp.json()

def main():
    try:
        endpoint, api_key = load_config()
        hostname = socket.gethostname()
        processes = collect_processes()
        result = post_snapshot(endpoint, api_key, hostname, processes)
        print(f"Uploaded snapshot: {result}")
    except Exception as e:
        print(f"Agent error: {e}")

if __name__ == "__main__":
    main()
