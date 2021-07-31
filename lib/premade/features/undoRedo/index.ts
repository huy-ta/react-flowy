import { useStoreById } from '../../../store/state';
import { Elements } from '../../../types';
import { subscribeToFinalElementChanges } from '../subscription';
import { registerUndoRedoKeyboardShortcuts } from './keyboardShortcuts';
import { updateUndoRedoStore } from './store';
import { UndoRedo } from './UndoRedo';

export const initializeUndoRedo = (storeId: string) => {
  let skipSubscription = false;
  let batchUpdateTimeout: number;
  const useStore = useStoreById(storeId)!;
  const undoRedo = new UndoRedo<Elements>();

  subscribeToFinalElementChanges(storeId)(elements => {
    if (batchUpdateTimeout) clearTimeout(batchUpdateTimeout);

    if (skipSubscription) {
      window.setTimeout(() => {
        skipSubscription = false;
      });

      return;
    }

    batchUpdateTimeout = window.setTimeout(() => {
      undoRedo.save(elements);
  
      updateUndoRedoStore(undoRedo);
    }, 100);
  });

  const undo = () => {
    const undo = undoRedo.undo();

    updateUndoRedoStore(undoRedo);
  
    if (!undo) return;
  
    skipSubscription = true;
    useStore.getState().setElements(undo as Elements);
  };
  
  const redo = () => {
    const redo = undoRedo.redo();

    updateUndoRedoStore(undoRedo);
  
    if (!redo) return;
  
    skipSubscription = true;
    useStore.getState().setElements(redo);
  };

  registerUndoRedoKeyboardShortcuts({ undo, redo });

  return {
    undo,
    redo,
    undoRedoInstance: undoRedo,
  }
};
