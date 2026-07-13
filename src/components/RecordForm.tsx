import React, { useState, useRef, useEffect } from 'react';
import { ButterflyRecord, RecordType } from '../types';
import { useImageCompress } from '../hooks/useImageCompress';

interface RecordFormProps {
  plantId: string;
  editingRecord: ButterflyRecord | null;
  onClose: () => void;
  onSave: (record: ButterflyRecord) => void;
  defaultType?: RecordType;
}

export function RecordForm({ plantId, editingRecord, onClose, onSave, defaultType }: RecordFormProps) {
  const { compressImages } = useImageCompress();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editingRecord;

  const [form, setForm] = useState({
    type: (editingRecord?.type || defaultType || 'egg') as RecordType,
    species: editingRecord?.species || '',
    date: editingRecord?.date || new Date().toISOString().slice(0, 10),
    quantity: editingRecord?.quantity || 1,
    notes: editingRecord?.notes || '',
    instar: editingRecord?.instar || 0,
    expectedEmerge: editingRecord?.expectedEmerge || '',
    photos: editingRecord?.photos || [] as string[],
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.species.trim()) return;
    const now = new Date().toISOString();
    const record: ButterflyRecord = {
      id: editingRecord?.id || 'rec-' + crypto.randomUUID(),
      plantId,
      ...form,
      createdAt: editingRecord?.createdAt || now,
      updatedAt: now,
    };
    onSave(record);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const compressed = await compressImages(e.target.files);
      setForm((f) => ({ ...f, photos: [...f.photos, ...compressed] }));
    }
  };

  const removePhoto = (index: number) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  };

  const typeLabels: Record<RecordType, string> = { egg: '🥚 卵', larva: '🐛 幼蟲', pupa: '🦪 蛹' };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md md:max-h-[90vh] h-[100dvh] md:h-auto md:rounded-lg rounded-none overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{isEdit ? '編輯記錄' : '新增紀錄'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingRecord && !defaultType && (
              <div>
                <label className="block text-sm font-medium text-gray-700">類型</label>
                <div className="flex gap-2 mt-1">
                  {(['egg', 'larva', 'pupa'] as RecordType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`px-3 py-2 rounded text-sm ${form.type === t ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">蝶種 *</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} required />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">發現日期</label>
                <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700">數量</label>
                <input type="number" min={1} className="mt-1 w-full border rounded px-3 py-2" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
              </div>
            </div>
            {form.type === 'larva' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">齡期</label>
                <select className="mt-1 w-full border rounded px-3 py-2" value={form.instar} onChange={(e) => setForm({ ...form, instar: +e.target.value })}>
                  <option value={0}>未知</option>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}齡</option>)}
                </select>
              </div>
            )}
            {form.type === 'pupa' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">預計羽化日期</label>
                <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={form.expectedEmerge} onChange={(e) => setForm({ ...form, expectedEmerge: e.target.value })} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">備註</label>
              <textarea className="mt-1 w-full border rounded px-3 py-2" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">照片</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {form.photos.map((p, i) => (
                  <div key={i} className="relative w-16 h-16 rounded overflow-hidden border">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-xs rounded-bl">×</button>
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()} className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:border-blue-500 text-xs">+</button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">取消</button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">{isEdit ? '儲存' : '新增'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}