"use client";

import { useState } from "react";
import { File, Trash2, FolderOpen, Eye, Download, Search, SortDesc } from "lucide-react";

interface LargeFile {
  id: number;
  name: string;
  path: string;
  size: string;
  sizeBytes: number;
  type: string;
  modified: string;
  accessed: string;
}

export function LargeFiles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"size" | "name" | "modified">("size");
  const [files, setFiles] = useState<LargeFile[]>([
    {
      id: 1,
      name: "project_backup_2024.zip",
      path: "D:\\Backups\\",
      size: "12.4 GB",
      sizeBytes: 12400000000,
      type: "Archive",
      modified: "2024-11-15",
      accessed: "2024-12-01",
    },
    {
      id: 2,
      name: "4K_Movie_Collection.mkv",
      path: "D:\\Videos\\Movies\\",
      size: "8.7 GB",
      sizeBytes: 8700000000,
      type: "Video",
      modified: "2024-10-20",
      accessed: "2024-12-05",
    },
    {
      id: 3,
      name: "VM_Windows_11.vhd",
      path: "C:\\VirtualMachines\\",
      size: "45.2 GB",
      sizeBytes: 45200000000,
      type: "Virtual Disk",
      modified: "2024-12-08",
      accessed: "2024-12-09",
    },
    {
      id: 4,
      name: "database_dump.sql",
      path: "D:\\Databases\\",
      size: "6.3 GB",
      sizeBytes: 6300000000,
      type: "Database",
      modified: "2024-12-07",
      accessed: "2024-12-08",
    },
    {
      id: 5,
      name: "Adobe_Photoshop_Installer.exe",
      path: "C:\\Downloads\\",
      size: "3.8 GB",
      sizeBytes: 3800000000,
      type: "Installer",
      modified: "2024-09-12",
      accessed: "2024-09-12",
    },
    {
      id: 6,
      name: "old_system_image.iso",
      path: "E:\\Backups\\System\\",
      size: "18.9 GB",
      sizeBytes: 18900000000,
      type: "Disk Image",
      modified: "2024-06-15",
      accessed: "2024-06-15",
    },
    {
      id: 7,
      name: "GoPro_Summer_2024.mp4",
      path: "D:\\Videos\\GoPro\\",
      size: "5.4 GB",
      sizeBytes: 5400000000,
      type: "Video",
      modified: "2024-08-22",
      accessed: "2024-11-30",
    },
    {
      id: 8,
      name: "node_modules.tar.gz",
      path: "D:\\Projects\\WebApp\\",
      size: "2.1 GB",
      sizeBytes: 2100000000,
      type: "Archive",
      modified: "2024-12-01",
      accessed: "2024-12-09",
    },
  ]);

  const filteredFiles = files
    .filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.path.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "size") return b.sizeBytes - a.sizeBytes;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "modified") return new Date(b.modified).getTime() - new Date(a.modified).getTime();
      return 0;
    });

  const deleteFile = (id: number) => {
    if (confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      setFiles(files.filter(file => file.id !== id));
    }
  };

  const getFileIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "Video":
        return <File className={`${iconClass} text-purple-400`} />;
      case "Archive":
        return <File className={`${iconClass} text-yellow-400`} />;
      case "Database":
        return <File className={`${iconClass} text-blue-400`} />;
      case "Virtual Disk":
        return <File className={`${iconClass} text-red-400`} />;
      case "Installer":
        return <File className={`${iconClass} text-green-400`} />;
      case "Disk Image":
        return <File className={`${iconClass} text-orange-400`} />;
      default:
        return <File className={`${iconClass} text-gray-400`} />;
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.sizeBytes, 0);
  const formatBytes = (bytes: number) => {
    return (bytes / 1000000000).toFixed(1) + " GB";
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <File className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Large Files</h3>
            <p className="text-sm text-gray-400">
              {filteredFiles.length} files • {formatBytes(totalSize)} total
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <SortDesc className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-400 flex-shrink-0">Sort by:</span>
        {(["size", "name", "modified"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              sortBy === option
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Files Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">File</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Modified</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <File className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No files found</p>
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-white/5 transition-colors group">
                  {/* File Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-xs" title={file.name}>
                          {file.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-400 truncate max-w-xs font-mono text-xs" title={file.path}>
                      {file.path}
                    </p>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">{file.type}</span>
                  </td>

                  {/* Size */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-white font-mono">{file.size}</span>
                  </td>

                  {/* Modified */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">{file.modified}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-400 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 text-green-400 transition-all"
                        title="Open Location"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-400 transition-all"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Largest File</p>
          <p className="text-lg font-bold text-white">
            {files.length > 0 ? formatBytes(Math.max(...files.map(f => f.sizeBytes))) : "0 GB"}
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Avg File Size</p>
          <p className="text-lg font-bold text-white">
            {files.length > 0 ? formatBytes(totalSize / files.length) : "0 GB"}
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Total Files</p>
          <p className="text-lg font-bold text-white">{files.length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Potential Savings</p>
          <p className="text-lg font-bold text-green-400">
            {formatBytes(files.filter(f => 
              new Date(f.accessed) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            ).reduce((acc, f) => acc + f.sizeBytes, 0))}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-400/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400 mb-1">Space Saving Recommendations</p>
            <p className="text-xs text-gray-400 mb-2">
              Found {files.filter(f => new Date(f.accessed) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length} files 
              not accessed in 90+ days that could be archived or deleted.
            </p>
            <button className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              View Recommendations →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
