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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handlePlantClick = useCallback((id: string) => {
    setSelectedPlantId((prev) => (prev === id ? null : id));
    setHighlightedPlantId(null);
  }, []);

  const handleSidebarPlantClick = useCallback((plant: { id: string; x: number; y: number }) => {
    setHighlightedPlantId(plant.id);
    map.centerOn(plant.x, plant.y);
    setSidebarOpen(false); // close sidebar on mobile after selection
  }, [map]);

  return (
    <div className="flex flex-col h-full">
      <Toolbar
        editMode={editMode}
        onToggleEditMode={() => setEditMode((p) => !p)}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
      />
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
            onTouchStart={map.handleTouchStart}
            onTouchMove={map.handleTouchMove}
            mapMoved={map.mapMoved}
            screenToSVG={map.screenToSVG}
            zoomIn={map.zoomIn}
            zoomOut={map.zoomOut}
            resetView={map.resetView}
            svgWidth={SVG_WIDTH}
            svgHeight={SVG_HEIGHT}
          />
        </div>
        {/* Desktop sidebar: always visible, fixed width */}
        <div className="hidden md:block">
          <Sidebar
            selectedPlantId={selectedPlantId}
            onSelectPlant={setSelectedPlantId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onSidebarPlantClick={handleSidebarPlantClick}
          />
        </div>
      </div>
      <FilterBar value={filterType} onChange={setFilterType} />
      {/* Mobile sidebar: full-screen drawer */}
      <div
        className={`fixed inset-0 z-40 transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => { if (e.target === e.currentTarget) setSidebarOpen(false); }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl">
          <Sidebar
            selectedPlantId={selectedPlantId}
            onSelectPlant={setSelectedPlantId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onSidebarPlantClick={(plant) => {
              handleSidebarPlantClick(plant);
              setSidebarOpen(false);
            }}
          />
        </div>
      </div>
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