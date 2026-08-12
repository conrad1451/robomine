// src/components/ProcessingPanel.tsx

// CHQ: Claude AI (Sonnet) generated file

import { PROCESSING_RECIPES } from "../types";
import { useGameStore } from "../store/gameStore";

export function ProcessingPanel() {
  const { mines, materials, balance, processResources, sellMaterial } =
    useGameStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recipes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Recipes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROCESSING_RECIPES.map((recipe) => {
            const mine = mines.find((m) => m.type === recipe.input.type);
            const hasOre = (mine?.totalExtracted ?? 0) >= recipe.input.quantity;
            const canAfford = balance >= recipe.energyCost;
            const canProcess = hasOre && canAfford;

            return (
              <div
                key={recipe.id}
                className="bg-slate-700 p-4 rounded border border-green-400/30"
              >
                <p className="font-bold text-green-300 mb-1">
                  {recipe.icon} {recipe.label}
                </p>
                <p className="text-xs text-gray-400 mb-1">
                  Needs {recipe.input.quantity} {recipe.input.type} ore (have{" "}
                  {mine ? mine.totalExtracted.toFixed(0) : 0})
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Energy cost: ${recipe.energyCost.toLocaleString()} → +
                  {recipe.output.quantity} {recipe.label}
                </p>
                <button
                  onClick={() => processResources(recipe.id)}
                  disabled={!canProcess}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded text-sm transition disabled:opacity-50"
                >
                  {!hasOre
                    ? "Not Enough Ore"
                    : !canAfford
                      ? "Not Enough Cash"
                      : "Process"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-3">
          Refined Materials
        </h3>
        <div className="space-y-2">
          {materials.map((material) => (
            <div
              key={material.type}
              className="flex items-center justify-between bg-slate-700 px-4 py-2 rounded border border-green-400/20"
            >
              <div>
                <p className="text-sm font-medium text-gray-200">
                  {material.type.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-gray-400">
                  {material.quantity} in stock · ${material.value}/unit
                </p>
              </div>
              <button
                onClick={() => sellMaterial(material.type)}
                disabled={material.quantity <= 0}
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm transition disabled:opacity-50"
              >
                Sell All
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
