import React from 'react';

interface FilterBarProps {
  value: string;
  onChange: (val: 'all' | 'plant' | 'egg' | 'larva' | 'pupa') => void;
}

const filters: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '🌿' },
  { key: 'plant', label: '無紀錄', icon: '🌱' },
  { key: 'egg', label: '有卵', icon: '🥚' },
  { key: 'larva', label: '有幼蟲', icon: '🐛' },
  { key: 'pupa', label: '有蛹', icon: '🦪' },
];

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="bg-white border-t px-4 py-2 flex items-center gap-3 shrink-0 justify-center">
      <span className="text-sm text-gray-500 mr-2">篩選：</span>
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key as 'all')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            value === f.key
              ? 'bg-blue-500 text-white shadow'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {f.icon} {f.label}
        </button>
      ))}
    </div>
  );
}