import React, { useState } from 'react';
import { Plant, ButterflyRecord } from '../types';
import { useGarden } from '../context/GardenContext';
import { RecordForm } from './RecordForm';
import { PhotoGrid } from './PhotoGrid';

interface PlantDetailPanelProps {
  plant: Plant;
  records: ButterflyRecord[];
  editMode: boolean;
  onClose: () => void;
}

export function PlantDetailPanel({ plant, records, editMode, onClose }: PlantDetailPanelProps) {
  const { addRecord, updateRecord, deleteRecord, deletePlant } = useGarden();
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [activeType, setActiveType] = useState<ButterflyRecord['type']>('egg');
  const [editingRecord, setEditingRecord] = useState<ButterflyRecord | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const eggRecords = records.filter((r) => r.type === 'egg');
  const larvaRecords = records.filter((r) => r.type === 'larva');
  const pupaRecords = records.filter((r) => r.type === 'pupa');

  const handleDeletePlant = () => {
    if (!editMode) return;
    if (confirmDelete) {
      deletePlant(plant.id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };

  const handleAddRecord = (type: ButterflyRecord['type']) => {
    setEditingRecord(null);
    setActiveType(type);
    setShowRecordForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-green-700">{plant.name}</h2>
              <p className="text-sm text-gray-500 italic">{plant.species}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          {plant.photos.length > 0 && <PhotoGrid photos={plant.photos} onExpand={setExpandedPhoto} />}

          <div className="grid grid-cols-2 gap-2 text-sm my-4">
            {plant.variety && <div><span className="text-gray-500">品種：</span>{plant.variety}</div>}
            {plant.plantDate && <div><span className="text-gray-500">種植日期：</span>{plant.plantDate}</div>}
            <div><span className="text-gray-500">數量：</span>{plant.quantity}</div>
            {plant.notes && <div className="col-span-2"><span className="text-gray-500">備註：</span>{plant.notes}</div>}
          </div>

          <div className="border-t pt-4 space-y-4">
            {(['egg', 'larva', 'pupa'] as const).map((type) => {
              const typeRecords = type === 'egg' ? eggRecords : type === 'larva' ? larvaRecords : pupaRecords;
              const labels = { egg: '🥚 卵', larva: '🐛 幼蟲', pupa: '🦪 蛹' };
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{labels[type]}</h3>
                    {editMode && (
                      <button onClick={() => handleAddRecord(type)} className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">+ 新增</button>
                    )}
                  </div>
                  {typeRecords.length === 0 ? (
                    <p className="text-xs text-gray-400 pl-4">尚無紀錄</p>
                  ) : (
                    <ul className="space-y-2">
                      {typeRecords.map((rec) => (
                        <li key={rec.id} className="bg-gray-50 rounded p-3 text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium">{rec.species}</span>
                              {rec.type === 'larva' && rec.instar > 0 && <span className="text-xs text-orange-500 ml-2">{rec.instar}齡</span>}
                              <span className="text-gray-500 ml-2">×{rec.quantity}</span>
                              <span className="text-gray-400 ml-2 text-xs">{rec.date}</span>
                            </div>
                            {editMode && (
                              <div className="flex gap-2">
                                <button onClick={() => { setEditingRecord(rec); setShowRecordForm(true); }} className="text-blue-500 text-xs">編輯</button>
                                <button onClick={() => deleteRecord(rec.id)} className="text-red-500 text-xs">刪除</button>
                              </div>
                            )}
                          </div>
                          {rec.notes && <p className="text-gray-500 text-xs mt-1">{rec.notes}</p>}
                          {rec.expectedEmerge && <p className="text-red-500 text-xs mt-1">預計羽化：{rec.expectedEmerge}</p>}
                          {rec.photos.length > 0 && <PhotoGrid photos={rec.photos} onExpand={setExpandedPhoto} compact />}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {editMode && (
            <div className="border-t mt-4 pt-4 flex justify-between">
              <button onClick={handleDeletePlant} className={`px-3 py-1 rounded text-sm ${confirmDelete ? 'bg-red-500 text-white' : 'text-red-500 border border-red-300 hover:bg-red-50'}`}>
                {confirmDelete ? '確認刪除？' : '刪除植物'}
              </button>
              {confirmDelete && (
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-1 rounded text-sm text-gray-500 border hover:bg-gray-100">取消</button>
              )}
            </div>
          )}
        </div>
      </div>

      {expandedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setExpandedPhoto(null); }}>
          <img src={expandedPhoto} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" />
        </div>
      )}

      {showRecordForm && editMode && (
        <RecordForm
          plantId={plant.id}
          editingRecord={editingRecord}
          defaultType={activeType}
          onClose={() => { setShowRecordForm(false); setEditingRecord(null); }}
          onSave={(rec) => {
            if (editingRecord) updateRecord(rec);
            else addRecord(rec);
            setShowRecordForm(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}