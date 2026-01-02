"use client";

import { useState } from "react";
import { Brain, Play, Settings, Zap, Activity } from "lucide-react";

export function AnomalyDetector() {
  const [isScanning, setIsScanning] = useState(false);
  const [sensitivity, setSensitivity] = useState(70);
  const [selectedMetrics, setSelectedMetrics] = useState({
    cpu: true,
    memory: true,
    disk: true,
    network: true,
  });

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("Anomaly scan complete! Found 3 new anomalies.");
    }, 3000);
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Anomaly Detector</h3>
          <p className="text-sm text-gray-400">Machine learning-powered analysis</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sensitivity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Detection Sensitivity
              </label>
              <span className="text-sm font-bold text-white">{sensitivity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Aggressive</span>
            </div>
          </div>

          {/* Metrics Selection */}
          <div>
            <label className="text-sm font-medium text-white mb-3 block">Monitor Metrics</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(selectedMetrics).map(([key, enabled]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setSelectedMetrics({ ...selectedMetrics, [key]: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                  <span className="text-sm text-white capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Live Status */}
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-white">Model Status</p>
                <p className="text-xs text-gray-400">Neural network v2.4.1</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-white/5 rounded">
                <p className="text-xs text-gray-400">Training Data</p>
                <p className="text-sm font-bold text-white">30 days</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <p className="text-xs text-gray-400">Accuracy</p>
                <p className="text-sm font-bold text-green-400">94.3%</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <p className="text-xs text-gray-400">Last Updated</p>
                <p className="text-sm font-bold text-blue-400">2h ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`w-full px-6 py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isScanning
                ? "bg-purple-500/20 text-purple-400 border border-purple-400/30 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/20"
            }`}
          >
            {isScanning ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Analysis
              </>
            )}
          </button>

          <button className="w-full px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced Settings
          </button>

          {/* Info Box */}
          <div className="p-4 bg-blue-500/5 border border-blue-400/20 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">💡 How it works</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Our ML model analyzes historical patterns and detects deviations using 
              LSTM neural networks trained on 30 days of system metrics.
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-gray-400">Total Scans</span>
              <span className="text-sm font-bold text-white">1,247</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-gray-400">Anomalies Found</span>
              <span className="text-sm font-bold text-orange-400">342</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-gray-400">Avg Processing</span>
              <span className="text-sm font-bold text-green-400">1.2s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
