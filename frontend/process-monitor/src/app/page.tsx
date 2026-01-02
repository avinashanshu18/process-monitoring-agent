// // "use client";

// // import { ProcessHeader } from "@/components/process-monitor/header";
// // import { ProcessTree } from "@/components/process-monitor/process-tree";
// // import { ProcessCharts } from "@/components/process-monitor/charts";
// // import { ProcessMetadata } from "@/components/process-monitor/metadata";
// // import { useProcessMonitor } from "@/hooks/use-process-monitor";

// // export default function ProcessMonitor() {
// //   const {
// //     snapshot,
// //     hosts,
// //     selectedHost,
// //     setSelectedHost,
// //     status,
// //     mode,
// //   } = useProcessMonitor();

// //   return (
// //     <div className="min-h-screen bg-black">
// //       {/* Grid Background */}
// //       <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
// //         <div 
// //           className="absolute inset-0" 
// //           style={{
// //             backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)",
// //             backgroundSize: "60px 60px"
// //           }}
// //         />
// //       </div>

// //       {/* Gradient Overlay */}
// //       <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-950/10 pointer-events-none" />

// //       <ProcessHeader 
// //         hosts={hosts}
// //         selectedHost={selectedHost}
// //         onHostChange={setSelectedHost}
// //         status={status}
// //       />
      
// //       <main className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-12 space-y-6">
// //         {/* Metadata Cards */}
// //         <ProcessMetadata snapshot={snapshot} mode={mode} />

// //         {/* Process Tree */}
// //         <div className="glass rounded-xl p-6">
// //           <div className="mb-6">
// //             <h2 className="text-2xl font-bold gradient-text mb-2">Process Tree</h2>
// //             <p className="text-sm text-gray-400">Real-time system process monitoring</p>
// //           </div>
// //           <ProcessTree processes={snapshot?.processes || []} />
// //         </div>

// //         {/* Charts */}
// //         <ProcessCharts processes={snapshot?.processes || []} />
// //       </main>
// //     </div>
// //   );
// // }


// "use client";

// import { StatsCards } from "@/components/dashboard/stats-cards";
// import { SystemHealthChart } from "@/components/dashboard/system-health-chart";
// import { TopProcesses } from "@/components/dashboard/top-processes";
// import { RealtimeMetrics } from "@/components/dashboard/realtime-metrics";
// import { QuickActions } from "@/components/dashboard/quick-actions";

// export default function DashboardPage() {
//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-white mb-2">System Overview</h1>
//         <p className="text-gray-400">Real-time monitoring of your system performance</p>
//       </div>

//       {/* Stats Cards */}
//       <StatsCards />

//       {/* Main Content Grid */}
//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* Left Column - 2/3 */}
//         <div className="lg:col-span-2 space-y-6">
//           <SystemHealthChart />
//           <TopProcesses />
//         </div>

//         {/* Right Column - 1/3 */}
//         <div className="space-y-6">
//           <RealtimeMetrics />
//           <QuickActions />
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { ProcessHeader } from "@/components/process-monitor/header";
import { ProcessTree } from "@/components/process-monitor/process-tree";
import { ProcessCharts } from "@/components/process-monitor/charts";
import { ProcessMetadata } from "@/components/process-monitor/metadata";
import { useProcessMonitor } from "@/hooks/use-process-monitor";

export default function ProcessMonitor() {
  const {
    snapshot,
    hosts,
    selectedHost,
    setSelectedHost,
    status,
    mode,
  } = useProcessMonitor();

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Process Monitor</h1>
          <p className="text-gray-400">Real-time monitoring of system processes</p>
        </div>

        <ProcessHeader 
          hosts={hosts}
          selectedHost={selectedHost}
          onHostChange={setSelectedHost}
          status={status}
        />

        {/* Metadata Cards */}
        <ProcessMetadata snapshot={snapshot} mode={mode} />

        {/* Process Tree */}
        <div className="glass rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Active Processes</h2>
            <p className="text-sm text-gray-400">Monitor and manage running processes</p>
          </div>
          <ProcessTree processes={snapshot?.processes || []} />
        </div>

        {/* Charts */}
        <ProcessCharts processes={snapshot?.processes || []} />
      </div>
    </LayoutWrapper>
  );
}
