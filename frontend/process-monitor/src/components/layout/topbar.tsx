// "use client";

// import { Menu, Bell, Settings, User } from "lucide-react";

// export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
//   return (
//     <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
//       <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
//         {/* Left: Logo + Menu */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={onMenuClick}
//             className="lg:hidden p-2 rounded-lg hover:bg-white/5"
//           >
//             <Menu className="w-6 h-6 text-gray-400" />
//           </button>

//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
//               <Activity className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h1 className="text-lg font-bold gradient-text">ProcessMon</h1>
//               <p className="text-xs text-gray-400 hidden sm:block">Real-time System Monitor</p>
//             </div>
//           </div>
//         </div>

//         {/* Right: Actions */}
//         <div className="flex items-center gap-2">
//           {/* Status Badge */}
//           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-400/30 rounded-full">
//             <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
//             <span className="text-cyan-400 text-xs font-medium">Live</span>
//           </div>

//           {/* Notifications */}
//           <button className="relative p-2 rounded-lg hover:bg-white/5">
//             <Bell className="w-5 h-5 text-gray-400" />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
//           </button>

//           {/* Settings */}
//           <button className="p-2 rounded-lg hover:bg-white/5">
//             <Settings className="w-5 h-5 text-gray-400" />
//           </button>

//           {/* User */}
//           <button className="p-2 rounded-lg hover:bg-white/5">
//             <User className="w-5 h-5 text-gray-400" />
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }


"use client";

import { Menu, Bell, Settings, User, Activity } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: Logo + Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-400" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">ProcessMon</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Real-time System Monitor</p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-400/30 rounded-full">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-xs font-medium">Live</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>

          {/* User */}
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <User className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
