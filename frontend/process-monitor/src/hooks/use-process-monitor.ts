"use client";

import { useState, useEffect } from "react";

export function useProcessMonitor() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [hosts, setHosts] = useState<string[]>(["localhost"]);
  const [selectedHost, setSelectedHost] = useState("localhost");
  const [status, setStatus] = useState("Idle");
  const [mode, setMode] = useState("Live (WebSocket)");

  // Mock data for testing
  useEffect(() => {
    const mockSnapshot = {
      hostname: selectedHost,
      created_at: new Date().toISOString(),
      processes: [
        { pid: 1, ppid: 0, name: "systemd", cpu_percent: 0.1, memory_mb: 12.5 },
        { pid: 100, ppid: 1, name: "chrome", cpu_percent: 45.2, memory_mb: 512.3 },
        { pid: 200, ppid: 1, name: "node", cpu_percent: 23.8, memory_mb: 256.7 },
        { pid: 300, ppid: 1, name: "python", cpu_percent: 12.3, memory_mb: 128.4 },
        { pid: 400, ppid: 1, name: "firefox", cpu_percent: 38.5, memory_mb: 412.1 },
      ],
    };
    
    setSnapshot(mockSnapshot);
    setStatus("Connected");
  }, [selectedHost]);

  return {
    snapshot,
    hosts,
    selectedHost,
    setSelectedHost,
    status,
    mode,
  };
}
