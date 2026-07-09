import { GardenState } from '../types';
import { loadState } from './storage';

export function exportJSON(): void {
  const state = loadState();
  if (!state) return;
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `butterfly_garden_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportJSON(json: string): GardenState | null {
  try {
    const data = JSON.parse(json);
    if (!data.plants || !Array.isArray(data.plants)) return null;
    if (!data.butterflyRecords || !Array.isArray(data.butterflyRecords)) return null;
    return data as GardenState;
  } catch {
    return null;
  }
}