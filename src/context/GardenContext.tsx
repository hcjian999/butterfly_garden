import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { GardenState, GardenAction, Plant, ButterflyRecord } from '../types';
import { loadState, saveState } from '../utils/storage';

const initialState: GardenState = {
  plants: [],
  butterflyRecords: [],
};

function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case 'ADD_PLANT':
      return { ...state, plants: [...state.plants, action.payload] };
    case 'UPDATE_PLANT':
      return {
        ...state,
        plants: state.plants.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_PLANT':
      return {
        ...state,
        plants: state.plants.filter((p) => p.id !== action.payload),
        butterflyRecords: state.butterflyRecords.filter((r) => r.plantId !== action.payload),
      };
    case 'MOVE_PLANT':
      return {
        ...state,
        plants: state.plants.map((p) =>
          p.id === action.payload.id
            ? { ...p, x: action.payload.x, y: action.payload.y, updatedAt: new Date().toISOString() }
            : p
        ),
      };
    case 'ADD_RECORD':
      return { ...state, butterflyRecords: [...state.butterflyRecords, action.payload] };
    case 'UPDATE_RECORD':
      return {
        ...state,
        butterflyRecords: state.butterflyRecords.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case 'DELETE_RECORD':
      return {
        ...state,
        butterflyRecords: state.butterflyRecords.filter((r) => r.id !== action.payload),
      };
    case 'LOAD_STATE':
      return action.payload;
    case 'IMPORT_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface GardenContextType {
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
  addPlant: (plant: Plant) => void;
  updatePlant: (plant: Plant) => void;
  deletePlant: (id: string) => void;
  movePlant: (id: string, x: number, y: number) => void;
  addRecord: (record: ButterflyRecord) => void;
  updateRecord: (record: ButterflyRecord) => void;
  deleteRecord: (id: string) => void;
}

const GardenContext = createContext<GardenContextType | null>(null);

export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gardenReducer, initialState);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  useEffect(() => {
    if (state.plants.length > 0 || state.butterflyRecords.length > 0) {
      saveState(state);
    }
  }, [state]);

  const addPlant = useCallback(
    (plant: Plant) => dispatch({ type: 'ADD_PLANT', payload: plant }),
    []
  );
  const updatePlant = useCallback(
    (plant: Plant) => dispatch({ type: 'UPDATE_PLANT', payload: plant }),
    []
  );
  const deletePlant = useCallback(
    (id: string) => dispatch({ type: 'DELETE_PLANT', payload: id }),
    []
  );
  const movePlant = useCallback(
    (id: string, x: number, y: number) =>
      dispatch({ type: 'MOVE_PLANT', payload: { id, x, y } }),
    []
  );
  const addRecord = useCallback(
    (record: ButterflyRecord) => dispatch({ type: 'ADD_RECORD', payload: record }),
    []
  );
  const updateRecord = useCallback(
    (record: ButterflyRecord) => dispatch({ type: 'UPDATE_RECORD', payload: record }),
    []
  );
  const deleteRecord = useCallback(
    (id: string) => dispatch({ type: 'DELETE_RECORD', payload: id }),
    []
  );

  return (
    <GardenContext.Provider
      value={{ state, dispatch, addPlant, updatePlant, deletePlant, movePlant, addRecord, updateRecord, deleteRecord }}
    >
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error('useGarden must be used within GardenProvider');
  return ctx;
}