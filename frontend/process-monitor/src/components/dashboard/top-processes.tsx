"use client";

import { Cpu, HardDrive, TrendingUp, X } from "lucide-react";
import { useState } from "react";

interface ProcessData {
  id: number;
  name: string;
  cpu: number;
  memory: number;
  pid: number;
}

const mockProcesses: ProcessData[] = [
  { id: 1, name: "chrome.exe", cpu: 45.2, memory: 512.3, pid: 1024 },
  { id: 2, name: "node.exe", cpu: 23.8, memory: 256.7, pid: 2048 },
  { id: 3, name: "code.exe", cpu: 18.5, memory: 412.1, pid: 3072 },
  { id: 4, name: "firefox.exe", cpu: 12.3, memory: 128.4, pid: 4096 },
  { id: 5, name: "python.exe", cpu: 8.7, memory: 95.2, pid: 5120 },
];

export function TopProcesses() {
  const [sortBy, setSortBy] = useState<"cpu" | "memory">("cpu");

  const sortedProcesses = [...mockProcesses].sort((a, b) => 
    sortBy === "cpu" ? b.cpu - a.cpu : b.memory - a.memory
  );

  const handleKillProcess = (pid: number, name: string) => {
    if (confirm(`Are you sure you want to kill ${name} (PID: ${pid})?`)) {
      console.log(`Killing process ${pid}`);
      // Add kill logic here
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Top Processes</h3>
          <p className="text-sm text-gray-400">Highest resource usage</p>
        </div>

        {/* Sort Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("cpu")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortBy === "cpu"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Cpu className="w-4 h-4" />
            CPU
          </button>
          <button
            onClick={() => setSortBy("memory")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortBy === "memory"
                ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HardDrive className="w-4 h-4" />
            Memory
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedProcesses.map((process, index) => (
          <div
            key={process.id}
            className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            {/* Rank */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
              index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' :
              index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
              index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
              'bg-white/10 text-gray-400'
            }`}>
              {index + 1}
            </div>

            {/* Process Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-white truncate">{process.name}</p>
                <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-400/30 rounded text-xs text-blue-400 font-mono">
                  {process.pid}
                </span>
              </div>
              
              {/* Progress Bars */}
              <div className="flex items-center gap-3">
                {/* CPU Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">CPU</span>
                    <span className="text-xs text-cyan-400 font-mono">{process.cpu}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${process.cpu}%` }}
                    />
                  </div>
                </div>

                {/* Memory Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Memory</span>
                    <span className="text-xs text-purple-400 font-mono">{process.memory} MB</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${(process.memory / 1024) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => handleKillProcess(process.pid, process.name)}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all duration-200"
              title="Kill Process"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <button className="w-full mt-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center justify-center gap-2 transition-colors">
        View All Processes
        <TrendingUp className="w-4 h-4" />
      </button>
    </div>
  );
}
