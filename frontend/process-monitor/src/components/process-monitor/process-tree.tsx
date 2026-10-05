"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Cpu, HardDrive, Server } from "lucide-react";

interface Process {
  pid: number;
  ppid: number | null;
  name: string;
  cpu_percent?: number | null;
  memory_mb?: number | null;
}

interface ProcessTreeProps {
  processes: Process[];
}

export function ProcessTree({ processes }: ProcessTreeProps) {
  if (!processes || processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Server className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-sm">No processes found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {processes.map((process) => (
        <ProcessRow key={process.pid} process={process} />
      ))}
    </div>
  );
}

function ProcessRow({ process }: { process: Process }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = false; // Simplified for now

  const cpuPercent = process.cpu_percent ?? 0;
  const memoryMb = process.memory_mb ?? 0;

  // Color coding based on usage
  const cpuColor = cpuPercent > 50 ? "text-red-400" : cpuPercent > 20 ? "text-yellow-400" : "text-green-400";
  const memColor = memoryMb > 500 ? "text-red-400" : memoryMb > 200 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="group">
      <div className="flex items-center gap-3 px-4 py-3 glass rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer">
        {/* Expand/Collapse Icon */}
        <div className="w-5 h-5 flex items-center justify-center text-gray-600">
          {hasChildren && (
            isExpanded ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
          )}
        </div>

        {/* PID Badge */}
        <div className="px-2 py-1 bg-blue-500/10 border border-blue-400/30 rounded text-xs font-mono text-blue-400">
          {process.pid}
        </div>

        {/* Process Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{process.name}</p>
          {process.ppid && process.ppid !== 0 && (
            <p className="text-xs text-gray-500">Parent: {process.ppid}</p>
          )}
        </div>

        {/* CPU Usage */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-lg">
          <Cpu className={`w-4 h-4 ${cpuColor}`} />
          <span className={`text-xs font-mono ${cpuColor}`}>
            {cpuPercent.toFixed(1)}%
          </span>
        </div>

        {/* Memory Usage */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-lg">
          <HardDrive className={`w-4 h-4 ${memColor}`} />
          <span className={`text-xs font-mono ${memColor}`}>
            {memoryMb.toFixed(1)} MB
          </span>
        </div>

        {/* Mobile Stats */}
        <div className="flex sm:hidden flex-col items-end gap-1">
          <span className={`text-xs font-mono ${cpuColor}`}>{cpuPercent.toFixed(1)}%</span>
          <span className={`text-xs font-mono ${memColor}`}>{memoryMb.toFixed(0)}MB</span>
        </div>
      </div>
    </div>
  );
}
