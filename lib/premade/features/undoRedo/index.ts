import isDeepEqual from 'fast-deep-equal';
import { useStore } from '../../../store/state';
import { Elements } from '../../../types';
import { UndoRedo } from './UndoRedo';

export const initializeUndoRedo = () => {
  let skipSubscription = false;
  let updateTimeout: number;

  let previousElements: Elements = [];

  const undoRedo = new UndoRedo<Elements>();

  useStore.subscribe((elements: Elements | undefined) => {
    if (!elements) return;

    if (updateTimeout) clearTimeout(updateTimeout);

    updateTimeout = window.setTimeout(() => {
      undoRedo.save(elements);
    }, 500);
  }, state => {
    const edges = state.edges.filter(edge => edge.target !== '?' && !edge.isForming);
    const elements = [...state.nodes, ...edges];

    if (isDeepEqual(previousElements, elements)) return;

    if (skipSubscription) {
      window.setTimeout(() => {
        skipSubscription = false;
      }, 500);

      return;
    }

    previousElements = edges;

    return elements;
  });

  let isCtrlJustPressed = false;

  document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'Control') {
      isCtrlJustPressed = true;

      window.setTimeout(() => isCtrlJustPressed = false, 200);

      return;
    }

    if ((!e.ctrlKey && !isCtrlJustPressed) || e.key !== 'z') return;

    undo();
  });

  document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'Control') {
      isCtrlJustPressed = true;

      window.setTimeout(() => isCtrlJustPressed = false, 200);

      return;
    }

    if ((!e.ctrlKey && !isCtrlJustPressed) || e.key !== 'y') return;

    redo();
  });

  const undo = () => {
    const undo = undoRedo.undo();
  
    if (!undo) return;
  
    skipSubscription = true;
    useStore.getState().setElements(undo as Elements);
  };
  
  const redo = () => {
    const redo = undoRedo.redo();
  
    if (!redo) return;
  
    skipSubscription = true;
    useStore.getState().setElements(redo);
  };

  return {
    undo,
    redo,
  }
};
