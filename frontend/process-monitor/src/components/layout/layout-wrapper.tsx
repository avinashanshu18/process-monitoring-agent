// "use client";

// import { Sidebar } from "./sidebar";
// import { TopBar } from "./topbar";
// import { useState } from "react";

// export function LayoutWrapper({ children }: { children: React.ReactNode }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-black">
//       {/* Grid background */}
//       <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
//         <div 
//           className="absolute inset-0" 
//           style={{
//             backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)",
//             backgroundSize: "60px 60px"
//           }}
//         />
//       </div>

//       <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
//       <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
//       <main className="lg:ml-64 pt-20 px-4 sm:px-6 lg:px-8 pb-12">
//         {children}
//       </main>
//     </div>
//   );
// }


"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { useState } from "react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-950/10 pointer-events-none" />

      <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="relative z-10 lg:ml-64 pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        {children}
      </main>
    </div>
  );
}
