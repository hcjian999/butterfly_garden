import React, { useState, useRef, useEffect } from 'react';
import { Plant } from '../types';
import { useImageCompress } from '../hooks/useImageCompress';

interface PlantFormProps {
  onClose: () => void;
  onSave: (plant: Plant) => void;
  initialPos?: { x: number; y: number };
  editingPlant?: Plant | null;
}

export function PlantForm({ onClose, onSave, initialPos, editingPlant }: PlantFormProps) {
  const { compressImages } = useImageCompress();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editingPlant;

  const [form, setForm] = useState({
    name: editingPlant?.name || '',
    species: editingPlant?.species || '',
    variety: editingPlant?.variety || '',
    plantDate: editingPlant?.plantDate || '',
    quantity: editingPlant?.quantity || 1,
    notes: editingPlant?.notes || '',
    photos: editingPlant?.photos || [] as string[],
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    const plant: Plant = {
      id: editingPlant?.id || 'plant-' + crypto.randomUUID(),
      x: editingPlant?.x ?? initialPos?.x ?? 1023,
      y: editingPlant?.y ?? initialPos?.y ?? 664,
      ...form,
      createdAt: editingPlant?.createdAt || now,
      updatedAt: now,
    };
    onSave(plant);
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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg md:max-h-[90vh] h-[100dvh] md:h-auto md:rounded-lg rounded-none overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{isEdit ? '編輯植物' : '新增植物'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">植物名稱 *</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">學名</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">品種</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">種植日期</label>
                <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={form.plantDate} onChange={(e) => setForm({ ...form, plantDate: e.target.value })} />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700">數量</label>
                <input type="number" min={1} className="mt-1 w-full border rounded px-3 py-2" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">備註</label>
              <textarea className="mt-1 w-full border rounded px-3 py-2" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">照片</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {form.photos.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded overflow-hidden border">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl">×</button>
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()} className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:border-green-500">+</button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">取消</button>
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">{isEdit ? '儲存' : '新增'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}