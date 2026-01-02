// "use client";

// import { Home, Activity, HardDrive, Network, Settings, Shield, Bell } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// const navigation = [
//   { name: "Overview", href: "/", icon: Home },
//   { name: "Processes", href: "/processes", icon: Activity },
//   { name: "System", href: "/system", icon: HardDrive },
//   { name: "Network", href: "/network", icon: Network },
//   { name: "Security", href: "/security", icon: Shield },
//   { name: "Alerts", href: "/alerts", icon: Bell },
//   { name: "Settings", href: "/settings", icon: Settings },
// ];

// export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
//   const pathname = usePathname();

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
//           onClick={onClose}
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`
//         fixed top-0 left-0 z-50 h-screen w-64
//         bg-black/80 backdrop-blur-md border-r border-white/10
//         transform transition-transform duration-300 ease-in-out
//         ${isOpen ? 'translate-x-0' : '-translate-x-full'}
//         lg:translate-x-0
//       `}>
//         <div className="flex flex-col h-full pt-20 px-4">
//           <nav className="flex-1 space-y-1">
//             {navigation.map((item) => {
//               const Icon = item.icon;
//               const isActive = pathname === item.href;
              
//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   onClick={onClose}
//                   className={`
//                     flex items-center gap-3 px-4 py-3 rounded-lg
//                     transition-all duration-200
//                     ${isActive 
//                       ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400' 
//                       : 'text-gray-400 hover:text-white hover:bg-white/5'
//                     }
//                   `}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span className="font-medium">{item.name}</span>
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Device Selector */}
//           <div className="border-t border-white/10 pt-4 pb-6">
//             <select className="w-full glass px-4 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
//               <option>My Desktop</option>
//               <option>My Laptop</option>
//               <option>Android Phone</option>
//             </select>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// }


"use client";

import { Home, Activity, HardDrive, Network, Settings, Shield, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// const navigation = [
//   { name: "Overview", href: "/", icon: Home },
//   { name: "Processes", href: "/processes", icon: Activity },
//   { name: "System", href: "/system", icon: HardDrive },
//   { name: "Network", href: "/network", icon: Network },
//   { name: "Security", href: "/security", icon: Shield },
//   { name: "Alerts", href: "/alerts", icon: Bell },
//   { name: "Settings", href: "/settings", icon: Settings },
// ];

const navigation = [
  { name: "Overview", href: "/overview", icon: Home },  // Changed from "/"
  { name: "Processes", href: "/", icon: Activity },     // Changed to "/"
  { name: "System", href: "/system", icon: HardDrive },
  { name: "Network", href: "/network", icon: Network },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64
        bg-black/80 backdrop-blur-md border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full pt-20 px-4">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Device Selector */}
          <div className="border-t border-white/10 pt-4 pb-6">
            <label htmlFor="device-select" className="text-xs text-gray-400 mb-2 block">
              Current Device
            </label>
            <select 
              id="device-select"
              className="w-full glass px-4 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
            >
              <option>My Desktop</option>
              <option>My Laptop</option>
              <option>Android Phone</option>
            </select>
          </div>
        </div>
      </aside>
    </>
  );
}
