import React, { useState, useRef } from 'react';
import { useGarden } from '../context/GardenContext';
import { PlantMarker } from './PlantMarker';
import { PlantForm } from './PlantForm';
import { PlantDetailPanel } from './PlantDetailPanel';
import { Plant } from '../types';
import { ViewState } from '../hooks/useMapInteraction';
import BUTTERFLY_SVG from '../assets/butterfly_top_view.svg?raw';

interface GardenMapProps {
  view: ViewState;
  editMode: boolean;
  isDragging: boolean;
  selectedPlantId: string | null;
  highlightedPlantId: string | null;
  filterType: string;
  searchQuery: string;
  onPlantClick: (id: string) => void;
  onMapClick: () => void;
  onWheel: (e: React.WheelEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  mapMoved: React.MutableRefObject<boolean>;
  screenToSVG: (x: number, y: number) => { x: number; y: number } | null;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  svgWidth: number;
  svgHeight: number;
}

export function GardenMap({
  view,
  editMode,
  isDragging,
  selectedPlantId,
  highlightedPlantId,
  filterType,
  searchQuery,
  onPlantClick,
  onMapClick,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  mapMoved,
  screenToSVG,
  zoomIn,
  zoomOut,
  resetView,
  svgWidth,
  svgHeight,
}: GardenMapProps) {
  const { state, addPlant, updatePlant, movePlant } = useGarden();
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [newPlantPos, setNewPlantPos] = useState<{ x: number; y: number } | null>(null);
  const justDraggedPlant = useRef(false);

  const handleSVGClick = (e: React.MouseEvent) => {
    if (!editMode) return;
    if (mapMoved.current) {
      mapMoved.current = false;
      return;
    }
    if (justDraggedPlant.current) {
      justDraggedPlant.current = false;
      return;
    }
    const target = e.target as SVGElement;
    if (target.closest('[data-plant]')) return;
    const pos = screenToSVG(e.clientX, e.clientY);
    if (pos) {
      setNewPlantPos(pos);
      setEditingPlant(null);
      setShowForm(true);
    }
    onMapClick();
  };

  const handlePlantDoubleClick = (plant: Plant) => {
    if (!editMode) return;
    setEditingPlant(plant);
    setNewPlantPos(null);
    setShowForm(true);
  };

  const handlePlantDrag = (id: string, x: number, y: number) => {
    justDraggedPlant.current = true;
    movePlant(id, x, y);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setNewPlantPos(null);
    setEditingPlant(null);
  };

  const selectedPlant = state.plants.find((p) => p.id === selectedPlantId);

  const filteredPlants = state.plants.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.species.toLowerCase().includes(q) && !p.notes.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterType === 'plant') {
      return !state.butterflyRecords.some((r) => r.plantId === p.id);
    }
    if (filterType !== 'all') {
      const typeMap: Record<string, string> = { egg: 'egg', larva: 'larva', pupa: 'pupa' };
      const targetType = typeMap[filterType];
      return state.butterflyRecords.some((r) => r.plantId === p.id && r.type === targetType);
    }
    return true;
  });

  const svgWithPointerEvents = BUTTERFLY_SVG.replace(
    /style="fill:none;stroke:/g,
    'style="fill:none;pointer-events:none;stroke:'
  );

  return (
    <>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ cursor: isDragging ? 'grabbing' : editMode ? 'crosshair' : 'grab', touchAction: 'none' }}
        onClick={handleSVGClick}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        <g transform={`translate(${view.tx}, ${view.ty}) scale(${view.scale})`}>
          <g dangerouslySetInnerHTML={{ __html: svgWithPointerEvents }} />
          {filteredPlants.map((plant) => {
            const isSelected = plant.id === selectedPlantId || plant.id === highlightedPlantId;
            return (
              <PlantMarker
                key={plant.id}
                plant={plant}
                records={state.butterflyRecords.filter((r) => r.plantId === plant.id)}
                isSelected={isSelected}
                editMode={editMode}
                onClick={() => onPlantClick(plant.id)}
                onDoubleClick={() => handlePlantDoubleClick(plant)}
                onDrag={handlePlantDrag}
              />
            );
          })}
        </g>
      </svg>
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button onClick={zoomIn} className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-lg hover:bg-gray-100" title="放大">+</button>
        <button onClick={zoomOut} className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-lg hover:bg-gray-100" title="縮小">−</button>
        <button onClick={resetView} className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-sm hover:bg-gray-100" title="重置">⊡</button>
      </div>
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded pointer-events-none">
        v1.2.1
      </div>
      {showForm && (
        <PlantForm
          onClose={handleFormClose}
          onSave={(plant) => {
            if (editingPlant) updatePlant(plant);
            else addPlant(plant);
            handleFormClose();
          }}
          initialPos={newPlantPos || undefined}
          editingPlant={editingPlant}
        />
      )}
      {selectedPlant && selectedPlantId && (
        <PlantDetailPanel
          plant={selectedPlant}
          records={state.butterflyRecords.filter((r) => r.plantId === selectedPlant.id)}
          editMode={editMode}
          onClose={() => onMapClick()}
        />
      )}
    </>
  );
}