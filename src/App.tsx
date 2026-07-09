import React, { useState, useCallback } from 'react';
import { GardenProvider } from './context/GardenContext';
import { GardenMap } from './components/GardenMap';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { Toolbar } from './components/Toolbar';
import { useMapInteraction, SVG_WIDTH, SVG_HEIGHT } from './hooks/useMapInteraction';

function AppInner() {
  const map = useMapInteraction();
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [highlightedPlantId, setHighlightedPlantId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'plant' | 'egg' | 'larva' | 'pupa'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);

  const handlePlantClick = useCallback((id: string) => {
    setSelectedPlantId((prev) => (prev === id ? null : id));
    setHighlightedPlantId(null);
  }, []);

  const handleSidebarPlantClick = useCallback((plant: { id: string; x: number; y: number }) => {
    setHighlightedPlantId(plant.id);
    map.centerOn(plant.x, plant.y);
  }, [map]);

  return (
    <div className="flex flex-col h-full">
      <Toolbar editMode={editMode} onToggleEditMode={() => setEditMode((p) => !p)} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative overflow-hidden" ref={map.containerRef}>
          <GardenMap
            view={map.view}
            isDragging={map.isDragging}
            selectedPlantId={selectedPlantId}
            highlightedPlantId={highlightedPlantId}
            filterType={filterType}
            searchQuery={searchQuery}
            editMode={editMode}
            onPlantClick={handlePlantClick}
            onMapClick={() => setSelectedPlantId(null)}
            onWheel={map.handleWheel}
            onMouseDown={map.handleMouseDown}
            onMouseMove={map.handleMouseMove}
            onMouseUp={map.handleMouseUp}
            mapMoved={map.mapMoved}
            screenToSVG={map.screenToSVG}
            zoomIn={map.zoomIn}
            zoomOut={map.zoomOut}
            resetView={map.resetView}
            svgWidth={SVG_WIDTH}
            svgHeight={SVG_HEIGHT}
          />
        </div>
        <Sidebar
          selectedPlantId={selectedPlantId}
          onSelectPlant={setSelectedPlantId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onSidebarPlantClick={handleSidebarPlantClick}
        />
      </div>
      <FilterBar value={filterType} onChange={setFilterType} />
    </div>
  );
}

export default function App() {
  return (
    <GardenProvider>
      <AppInner />
    </GardenProvider>
  );
}
