"use client";

import { useState } from "react";
import { Folder, FileText, Image, Film, Music, Archive, Code, ChevronDown, ChevronRight } from "lucide-react";

interface FileCategory {
  id: number;
  name: string;
  icon: any;
  size: string;
  sizeBytes: number;
  percentage: number;
  count: number;
  color: string;
  expanded?: boolean;
  subcategories?: Array<{
    name: string;
    size: string;
    count: number;
  }>;
}

export function FileSystemAnalyzer() {
  const [categories, setCategories] = useState<FileCategory[]>([
    {
      id: 1,
      name: "Documents",
      icon: FileText,
      size: "45.2 GB",
      sizeBytes: 45200000000,
      percentage: 32,
      count: 12847,
      color: "from-blue-500 to-cyan-500",
      expanded: false,
      subcategories: [
        { name: "PDF Files", size: "18.3 GB", count: 3452 },
        { name: "Word Documents", size: "15.7 GB", count: 5234 },
        { name: "Excel Spreadsheets", size: "8.9 GB", count: 2891 },
        { name: "PowerPoint", size: "2.3 GB", count: 1270 },
      ],
    },
    {
      id: 2,
      name: "Videos",
      icon: Film,
      size: "320.5 GB",
      sizeBytes: 320500000000,
      percentage: 55,
      count: 487,
      color: "from-purple-500 to-pink-500",
      expanded: false,
      subcategories: [
        { name: "MP4 Files", size: "245.2 GB", count: 324 },
        { name: "AVI Files", size: "52.8 GB", count: 98 },
        { name: "MKV Files", size: "22.5 GB", count: 65 },
      ],
    },
    {
      id: 3,
      name: "Images",
      icon: Image,
      size: "28.7 GB",
      sizeBytes: 28700000000,
      percentage: 18,
      count: 24532,
      color: "from-green-500 to-teal-500",
      expanded: false,
      subcategories: [
        { name: "JPEG/JPG", size: "15.4 GB", count: 18234 },
        { name: "PNG", size: "9.2 GB", count: 4521 },
        { name: "RAW", size: "3.8 GB", count: 1234 },
        { name: "GIF", size: "0.3 GB", count: 543 },
      ],
    },
    {
      id: 4,
      name: "Audio",
      icon: Music,
      size: "12.3 GB",
      sizeBytes: 12300000000,
      percentage: 8,
      count: 3421,
      color: "from-orange-500 to-red-500",
      expanded: false,
      subcategories: [
        { name: "MP3", size: "8.9 GB", count: 2834 },
        { name: "FLAC", size: "2.8 GB", count: 421 },
        { name: "WAV", size: "0.6 GB", count: 166 },
      ],
    },
    {
      id: 5,
      name: "Archives",
      icon: Archive,
      size: "67.8 GB",
      sizeBytes: 67800000000,
      percentage: 25,
      count: 892,
      color: "from-yellow-500 to-orange-500",
      expanded: false,
      subcategories: [
        { name: "ZIP", size: "42.1 GB", count: 523 },
        { name: "RAR", size: "18.7 GB", count: 234 },
        { name: "7Z", size: "7.0 GB", count: 135 },
      ],
    },
    {
      id: 6,
      name: "Code & Projects",
      icon: Code,
      size: "8.5 GB",
      sizeBytes: 8500000000,
      percentage: 5,
      count: 45672,
      color: "from-cyan-500 to-blue-500",
      expanded: false,
      subcategories: [
        { name: "JavaScript/TypeScript", size: "3.2 GB", count: 18234 },
        { name: "Python", size: "2.1 GB", count: 12456 },
        { name: "Java", size: "1.8 GB", count: 8934 },
        { name: "Other", size: "1.4 GB", count: 6048 },
      ],
    },
  ]);

  const toggleCategory = (id: number) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, expanded: !cat.expanded } : cat
    ));
  };

  const totalSize = categories.reduce((acc, cat) => acc + cat.sizeBytes, 0);

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">File System Analysis</h3>
            <p className="text-sm text-gray-400">Storage breakdown by file type</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg text-sm font-medium transition-all">
          Analyze Now
        </button>
      </div>

      {/* Visual Distribution */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-400">Storage Distribution</span>
          <span className="text-white font-mono">583 GB Total</span>
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden flex">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`bg-gradient-to-r ${cat.color} transition-all duration-500 relative group`}
              style={{ width: `${(cat.sizeBytes / totalSize) * 100}%` }}
              title={`${cat.name}: ${cat.size}`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {cat.name}: {cat.size}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="border border-white/10 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white">{category.name}</h4>
                    <span className="text-sm font-bold text-white">{category.size}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{category.count.toLocaleString()} files</span>
                    <span>•</span>
                    <span>{category.percentage}% of storage</span>
                  </div>
                </div>

                {/* Expand Icon */}
                {category.expanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Subcategories */}
              {category.expanded && category.subcategories && (
                <div className="bg-white/[0.02] border-t border-white/10">
                  {category.subcategories.map((sub, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 pl-16 hover:bg-white/5 transition-all flex items-center justify-between border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="text-sm text-white">{sub.name}</p>
                        <p className="text-xs text-gray-400">{sub.count.toLocaleString()} files</p>
                      </div>
                      <span className="text-sm font-mono text-gray-300">{sub.size}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Total Files</p>
          <p className="text-lg font-bold text-white">87,851</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Total Size</p>
          <p className="text-lg font-bold text-white">583 GB</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Avg File Size</p>
          <p className="text-lg font-bold text-white">6.8 MB</p>
        </div>
      </div>
    </div>
  );
}
