// "use client";

// import { Cpu, HardDrive, Network, Zap } from "lucide-react";

// const stats = [
//   {
//     name: "CPU Usage",
//     value: "42%",
//     change: "+2.4%",
//     trend: "up",
//     icon: Cpu,
//     color: "from-blue-500 to-cyan-500",
//   },
//   {
//     name: "Memory",
//     value: "8.2 GB",
//     change: "12.4 GB free",
//     trend: "neutral",
//     icon: HardDrive,
//     color: "from-purple-500 to-pink-500",
//   },
//   {
//     name: "Network",
//     value: "2.4 MB/s",
//     change: "-0.3 MB/s",
//     trend: "down",
//     icon: Network,
//     color: "from-green-500 to-teal-500",
//   },
//   {
//     name: "Uptime",
//     value: "14d 6h",
//     change: "No issues",
//     trend: "neutral",
//     icon: Zap,
//     color: "from-orange-500 to-red-500",
//   },
// ];

// export function StatsCards() {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//       {stats.map((stat) => {
//         const Icon = stat.icon;
//         return (
//           <div
//             key={stat.name}
//             className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
//           >
//             <div className="flex items-start justify-between">
//               <div className="flex-1">
//                 <p className="text-sm text-gray-400 mb-1">{stat.name}</p>
//                 <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
//                 <p className={`text-xs ${
//                   stat.trend === 'up' ? 'text-green-400' : 
//                   stat.trend === 'down' ? 'text-red-400' : 
//                   'text-gray-400'
//                 }`}>
//                   {stat.change}
//                 </p>
//               </div>
//               <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
//                 <Icon className="w-6 h-6 text-white" />
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }


"use client";

import { Cpu, HardDrive, Network, Zap } from "lucide-react";

const stats = [
  {
    name: "CPU Usage",
    value: "42%",
    change: "+2.4%",
    trend: "up",
    icon: Cpu,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Memory",
    value: "8.2 GB",
    change: "12.4 GB free",
    trend: "neutral",
    icon: HardDrive,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Network",
    value: "2.4 MB/s",
    change: "-0.3 MB/s",
    trend: "down",
    icon: Network,
    color: "from-green-500 to-teal-500",
  },
  {
    name: "Uptime",
    value: "14d 6h",
    change: "No issues",
    trend: "neutral",
    icon: Zap,
    color: "from-orange-500 to-red-500",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                <p className={`text-xs ${
                  stat.trend === 'up' ? 'text-green-400' : 
                  stat.trend === 'down' ? 'text-red-400' : 
                  'text-gray-400'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
