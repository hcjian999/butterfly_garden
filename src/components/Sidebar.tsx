import React, { useState, useMemo } from 'react';
import { useGarden } from '../context/GardenContext';
import { Plant } from '../types';

interface SidebarProps {
  selectedPlantId: string | null;
  onSelectPlant: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterType: string;
  onSidebarPlantClick: (plant: { id: string; x: number; y: number }) => void;
}

export function Sidebar({
  selectedPlantId,
  onSelectPlant,
  searchQuery,
  onSearchChange,
  filterType,
  onSidebarPlantClick,
}: SidebarProps) {
  const { state } = useGarden();
  const [expandedPlantId, setExpandedPlantId] = useState<string | null>(null);

  const filteredPlants = useMemo(() => {
    return state.plants.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.species.toLowerCase().includes(q) && !p.notes.toLowerCase().includes(q)) {
          const recs = state.butterflyRecords.filter((r) => r.plantId === p.id);
          if (!recs.some((r) => r.species.toLowerCase().includes(q))) {
            return false;
          }
        }
      }
      if (filterType !== 'all' && filterType !== 'plant') {
        const typeMap: Record<string, string> = { egg: 'egg', larva: 'larva', pupa: 'pupa' };
        return state.butterflyRecords.some((r) => r.plantId === p.id && r.type === typeMap[filterType]);
      }
      return true;
    });
  }, [state.plants, state.butterflyRecords, searchQuery, filterType]);

  const getRecords = (plantId: string) => state.butterflyRecords.filter((r) => r.plantId === plantId);

  const eggIcon = '🥚';
  const larvaIcon = '🐛';
  const pupaIcon = '🦪';

  return (
    <div className="w-72 bg-white border-l flex flex-col h-full shrink-0">
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="🔍 搜尋植物或蝶種..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 text-xs text-gray-400">
          共 {filteredPlants.length} 株植物
        </div>
        {filteredPlants.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">無符合條件的植物</p>
        )}
        {filteredPlants.map((plant) => {
          const records = getRecords(plant.id);
          const isExpanded = expandedPlantId === plant.id;
          const isSel = selectedPlantId === plant.id;
          return (
            <div key={plant.id} className={`border-b ${isSel ? 'bg-green-50' : ''}`}>
              <div
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  onSidebarPlantClick({ id: plant.id, x: plant.x, y: plant.y });
                  setExpandedPlantId(isExpanded ? null : plant.id);
                }}
              >
                <span className="text-lg mr-2">🌿</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{plant.name}</div>
                  <div className="text-xs text-gray-400 truncate">{plant.species}</div>
                </div>
                <span className="text-xs text-gray-400">{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && records.length > 0 && (
                <div className="bg-gray-50 px-4 py-2">
                  {records.map((rec) => (
                    <div key={rec.id} className="flex items-center text-xs py-1 gap-2">
                      <span>{rec.type === 'egg' ? eggIcon : rec.type === 'larva' ? larvaIcon : pupaIcon}</span>
                      <span className="font-medium">{rec.species}</span>
                      <span className="text-gray-400">×{rec.quantity}</span>
                      <span className="text-gray-400 ml-auto">{rec.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}