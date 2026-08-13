// src/components/MinePanel.tsx

// CHQ: Claude AI (Haiku) generated file

import { useGameStore } from "../store/gameStore";

import { MineCard } from "./MineCard";

export function MinePanel() {
  const { mines, robots } = useGameStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mines.map((mine) => {
        return <MineCard mine={mine} robots={robots} />;
      })}
    </div>
  );
}

// export function MinePanel() {
//   const { mines, robots, addRobot, balance, sellOre, upgradeMine } =
//     useGameStore();

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//       {mines.map((mine) => {
//         const assignedRobots = robots.filter(
//           (r) => r.assignedMine === mine.type,
//         );
//         const fillPct = Math.min(
//           100,
//           (mine.totalExtracted / mine.maxCapacity) * 100,
//         );
//         const isFull = mine.totalExtracted >= mine.maxCapacity;

//         return (
//           <div
//             key={mine.id}
//             className={`bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-lg border ${
//               isFull ? "border-red-500/60" : "border-yellow-500/30"
//             }`}
//           >
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-xl font-bold text-yellow-400">{mine.name}</h3>
//               {isFull && (
//                 <span className="text-xs font-semibold text-red-400 bg-red-950/60 px-2 py-1 rounded">
//                   FULL
//                 </span>
//               )}
//             </div>
//             <p className="text-gray-400 text-sm mb-4">Type: {mine.type}</p>

//             <div className="space-y-2 text-sm mb-3">
//               <p>
//                 📊 Depth: <span className="text-cyan-300">{mine.depth}m</span>
//               </p>
//               <p>
//                 ⚙️ Rate:{" "}
//                 <span className="text-cyan-300">
//                   {mine.resourcePerSecond.toFixed(2)}/sec
//                 </span>
//               </p>
//               <p>
//                 🤖 Robots:{" "}
//                 <span className="text-cyan-300">{assignedRobots.length}</span>
//               </p>
//               <p>
//                 📦 Lifetime Extracted:{" "}
//                 <span className="text-cyan-300">
//                   {mine.lifetimeExtracted.toFixed(0)}
//                 </span>
//               </p>
//             </div>

//             {/* CHQ: Claude AI (Sonnet): Stockpile / capacity bar */}
//             <div className="mb-4">
//               <div className="flex justify-between text-xs text-gray-400 mb-1">
//                 <span>Stockpile</span>
//                 <span>
//                   {mine.totalExtracted.toFixed(0)} / {mine.maxCapacity}
//                 </span>
//               </div>
//               <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
//                 <div
//                   className={`h-full ${isFull ? "bg-red-500" : "bg-yellow-400"}`}
//                   style={{ width: `${fillPct}%` }}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-2 mb-2">
//               <button
//                 onClick={() => {
//                   if (balance >= 5000) addRobot("basic", mine.type);
//                 }}
//                 className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition disabled:opacity-50"
//                 disabled={balance < 5000}
//               >
//                 Add Bot ($5K)
//               </button>
//               <button
//                 onClick={() => {
//                   if (balance >= 10000) upgradeMine(mine.type);
//                 }}
//                 className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm transition disabled:opacity-50"
//                 disabled={balance < 10000}
//               >
//                 Upgrade ($10K)
//               </button>
//             </div>

//             <button
//               onClick={() => sellOre(mine.type)}
//               className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 px-3 rounded text-sm transition disabled:opacity-50"
//               disabled={mine.totalExtracted <= 0}
//             >
//               Sell Ore ({mine.totalExtracted.toFixed(0)} units)
//             </button>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
