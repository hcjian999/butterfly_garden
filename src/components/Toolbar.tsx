import React, { useRef } from 'react';
import { useGarden } from '../context/GardenContext';
import { exportJSON, parseImportJSON } from '../utils/export';
import { loadSampleData } from '../utils/sampleData';

interface ToolbarProps {
  onToggleSidebar: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
}

export function Toolbar({ onToggleSidebar, editMode, onToggleEditMode }: ToolbarProps) {
  const { dispatch } = useGarden();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const data = parseImportJSON(text);
      if (data) {
        dispatch({ type: 'IMPORT_STATE', payload: data });
        alert('匯入成功！');
      } else {
        alert('匯入失敗：格式不正確');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSample = () => {
    const data = loadSampleData();
    dispatch({ type: 'IMPORT_STATE', payload: data });
  };

  return (
    <div className="bg-white border-b px-4 py-2 flex items-center gap-3 shadow-sm shrink-0 overflow-x-auto">
      <button
        onClick={onToggleSidebar}
        className="md:hidden flex-shrink-0 p-2 rounded hover:bg-gray-100"
        title="選單"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-base md:text-lg font-bold text-gray-800 whitespace-nowrap">🦋 清華蝴蝶園導覽統計系統</h1>
      <div className="flex-1" />
      <button
        onClick={onToggleEditMode}
        className={`px-2 md:px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
          editMode
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {editMode ? '✏️' : '🔒'}
        <span className="hidden md:inline ml-1">編輯模式</span>
      </button>
      {editMode && (
        <>
          <button
            onClick={handleImport}
            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 whitespace-nowrap"
          >
            匯入 JSON
          </button>
          <button
            onClick={() => {
              if (confirm('確定要清除所有植物的卵、幼蟲和蛹記錄嗎？此操作無法復原。')) {
                dispatch({ type: 'DELETE_ALL_RECORDS' });
              }
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 whitespace-nowrap"
          >
            🧹 清除記錄
          </button>
        </>
      )}
      <button
        onClick={exportJSON}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
      >
        匯出 JSON
      </button>
      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 ml-2 whitespace-nowrap">
        <span className="font-medium">荒野新竹42解雲杉</span>
        <a href="mailto:dave.jhc@gmail.com" className="text-blue-500 hover:underline">
          dave.jhc@gmail.com
        </a>
      </div>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
    </div>
  );
}