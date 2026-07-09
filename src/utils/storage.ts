import { GardenState } from '../types';

const STORAGE_KEY = 'butterfly_garden_data';

export function saveState(state: GardenState): void {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function loadState(): GardenState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json) as GardenState;
  } catch (e) {
    console.error('Failed to load state:', e);
    return null;
  }
}