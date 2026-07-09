import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plant, ButterflyRecord } from '../types';

interface PlantMarkerProps {
  plant: Plant;
  records: ButterflyRecord[];
  isSelected: boolean;
  editMode: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onDrag: (id: string, x: number, y: number) => void;
}

const TYPE_COLORS: Record<string, string> = {
  egg: '#F59E0B',
  larva: '#F97316',
  pupa: '#EF4444',
};

const DRAG_THRESHOLD = 3;

export function PlantMarker({ plant, records, isSelected, editMode, onClick, onDoubleClick, onDrag }: PlantMarkerProps) {
  const gRef = useRef<SVGGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const startPos = useRef<{ x: number; y: number; px: number; py: number }>({ x: 0, y: 0, px: 0, py: 0 });
  const dragRef = useRef(false);
  const moved = useRef(false);

  const eggCount = records.filter((r) => r.type === 'egg').length;
  const larvaCount = records.filter((r) => r.type === 'larva').length;
  const pupaCount = records.filter((r) => r.type === 'pupa').length;
  const hasRecords = eggCount + larvaCount + pupaCount > 0;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode) return;
      if (e.button !== 0) return;
      dragRef.current = true;
      moved.current = false;
      startPos.current = { x: e.clientX, y: e.clientY, px: plant.x, py: plant.y };
      e.stopPropagation();
      e.preventDefault();
    },
    [editMode, plant.x, plant.y]
  );

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        if (!moved.current) {
          moved.current = true;
          setDragging(true);
        }
        const el = gRef.current?.closest('svg');
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elW = rect.width;
        const elH = rect.height;
        const ratio = Math.min(elW / 2046, elH / 1328);
        const ddx = (e.clientX - startPos.current.x) / ratio;
        const ddy = (e.clientY - startPos.current.y) / ratio;
        onDrag(plant.id, startPos.current.px + ddx, startPos.current.py + ddy);
      }
    };

    const handleUp = () => {
      dragRef.current = false;
      try { setDragging(false); } catch (_) { /* ignore */ }
      moved.current = false;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [plant.id, onDrag]);

  return (
    <g
      ref={gRef}
      data-plant={plant.id}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if (moved.current) return;
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={(e) => {
        if (!editMode) return;
        e.stopPropagation();
        onDoubleClick();
      }}
      style={{ cursor: dragging ? 'none' : 'pointer' }}
    >
      <circle
        cx={plant.x}
        cy={plant.y}
        r={isSelected ? 10 : 7}
        fill={hasRecords ? '#E67E22' : '#4CAF50'}
        stroke={isSelected ? '#1B5E20' : '#fff'}
        strokeWidth={isSelected ? 3 : 1.5}
      />
      <text
        x={plant.x}
        y={plant.y - 13}
        textAnchor="middle"
        fontSize="11"
        fill="#1B5E20"
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {plant.name}
      </text>
      {hasRecords && hovered && (
        <g
          transform={`translate(${plant.x + 10}, ${plant.y - 5})`}
          style={{ pointerEvents: 'none' }}
        >
          {eggCount > 0 && (
            <text x="0" y="0" fontSize="10" fill={TYPE_COLORS.egg}>
              🥚{eggCount}
            </text>
          )}
          {larvaCount > 0 && (
            <text x={eggCount > 0 ? '32' : '0'} y="0" fontSize="10" fill={TYPE_COLORS.larva}>
              🐛{larvaCount}
            </text>
          )}
          {pupaCount > 0 && (
            <text
              x={(eggCount > 0 ? 28 : 0) + (larvaCount > 0 ? 28 : 0)}
              y="0"
              fontSize="10"
              fill={TYPE_COLORS.pupa}
            >
              🦪{pupaCount}
            </text>
          )}
        </g>
      )}
    </g>
  );
}