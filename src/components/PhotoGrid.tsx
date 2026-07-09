import React from 'react';

interface PhotoGridProps {
  photos: string[];
  onExpand: (photo: string) => void;
  compact?: boolean;
}

export function PhotoGrid({ photos, onExpand, compact }: PhotoGridProps) {
  if (photos.length === 0) return null;
  const size = compact ? 'w-12 h-12' : 'w-16 h-16';
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {photos.map((p, i) => (
        <img
          key={i}
          src={p}
          alt=""
          className={`${size} rounded object-cover border cursor-pointer hover:opacity-80`}
          onClick={() => onExpand(p)}
        />
      ))}
    </div>
  );
}