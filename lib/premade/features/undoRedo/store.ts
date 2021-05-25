import create from 'zustand';
import { UndoRedo } from './UndoRedo';

export interface UndoRedoStore {
  isUndoable: boolean;
  isRedoable: boolean;
  setIsUndoable: (isUndoable: boolean) => void;
  setIsRedoable: (isRedoable: boolean) => void;
}

export const useUndoRedoStore = create<UndoRedoStore>(set => ({
  isUndoable: false,
  isRedoable: false,
  setIsUndoable: (isUndoable: boolean) => set(state => ({ ...state, isUndoable })),
  setIsRedoable: (isRedoable: boolean) => set(state => ({ ...state, isRedoable })),
}));

export const updateUndoRedoStore = (undoRedo: UndoRedo<any>) => {
  useUndoRedoStore.getState().setIsUndoable(undoRedo.isUndoable());
  useUndoRedoStore.getState().setIsRedoable(undoRedo.isRedoable());
};
