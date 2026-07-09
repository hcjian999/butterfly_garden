import React, { useRef } from 'react';
import { useGarden } from '../context/GardenContext';
import { exportJSON, parseImportJSON } from '../utils/export';
import { loadSampleData } from '../utils/sampleData';

interface ToolbarProps {
  editMode: boolean;
  onToggleEditMode: () => void;
}

export function Toolbar({ editMode, onToggleEditMode }: ToolbarProps) {
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
    <div className="bg-white border-b px-4 py-2 flex items-center gap-3 shadow-sm shrink-0">
      <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">🦋 清華蝴蝶園導覽統計系統</h1>
      <div className="flex-1" />
      <button
        onClick={onToggleEditMode}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editMode
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {editMode ? '✏️ 編輯模式' : '🔒 瀏覽模式'}
      </button>
      {editMode && (
        <>
          <button
            onClick={handleLoadSample}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            載入範例
          </button>
          <button
            onClick={handleImport}
            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            匯入 JSON
          </button>
        </>
      )}
      <button
        onClick={exportJSON}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        匯出 JSON
      </button>
      <div className="flex items-center gap-2 text-xs text-gray-500 ml-2 whitespace-nowrap">
        <span className="font-medium">荒野42解雲杉</span>
        <a href="mailto:dave.jhc@gmail.com" className="text-blue-500 hover:underline">
          dave.jhc@gmail.com
        </a>
      </div>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
    </div>
  );
}