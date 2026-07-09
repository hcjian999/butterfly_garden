export interface Plant {
  id: string;
  x: number;
  y: number;
  name: string;
  species: string;
  variety: string;
  plantDate: string;
  quantity: number;
  photos: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type RecordType = 'egg' | 'larva' | 'pupa';

export interface ButterflyRecord {
  id: string;
  plantId: string;
  type: RecordType;
  species: string;
  date: string;
  quantity: number;
  photos: string[];
  instar: number;
  expectedEmerge: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GardenState {
  plants: Plant[];
  butterflyRecords: ButterflyRecord[];
}

export type GardenAction =
  | { type: 'ADD_PLANT'; payload: Plant }
  | { type: 'UPDATE_PLANT'; payload: Plant }
  | { type: 'DELETE_PLANT'; payload: string }
  | { type: 'MOVE_PLANT'; payload: { id: string; x: number; y: number } }
  | { type: 'ADD_RECORD'; payload: ButterflyRecord }
  | { type: 'UPDATE_RECORD'; payload: ButterflyRecord }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'LOAD_STATE'; payload: GardenState }
  | { type: 'IMPORT_STATE'; payload: GardenState };

