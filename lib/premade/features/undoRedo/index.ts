import create from 'zustand';
import { useStore } from '../../../store/state';
import { Node, Elements, Edge } from '../../../types';
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

export const initializeUndoRedo = () => {
  let skipSubscription = false;
  let isMouseMoving = false;
  let mouseUpCallback: Function | null;

  let previousElements: Elements = [];

  const undoRedo = new UndoRedo<Elements>();

  const updateUndoRedoStore = () => {
    useUndoRedoStore.getState().setIsUndoable(undoRedo.isUndoable());
    useUndoRedoStore.getState().setIsRedoable(undoRedo.isRedoable());
  };

  const normalizeUnstablePropertiesFromElements = (elements: Node[] | Edge[] | Elements) => {
    const elementsWithUnstablePropertiesExcluded = (elements as Node[]).map(({ width, height, ...node }) => node).filter(node => !node.isDragging);

    return (elementsWithUnstablePropertiesExcluded as unknown as Edge[]).filter(edge => !edge.isDragging);
  };

  useStore.subscribe((elements: Elements | undefined) => {
    if (!elements) return;

    const save = () => {
      undoRedo.save(elements);

      return updateUndoRedoStore();
    }

    if (!isMouseMoving) {
      save();
    }

    mouseUpCallback = save;
  }, state => {
    const edges = state.edges.filter(edge => edge.target !== '?' && !edge.isForming);
    const elements = [...state.nodes, ...edges];

    elements.forEach(({ id, isDragging }) => {
      if (isDragging) previousElements = previousElements.map(previousElement => {
        if (previousElement.id !== id) return previousElement;

        return { ...previousElement, isDragging };
      })
    });

    const previousElementsToCompare = normalizeUnstablePropertiesFromElements(previousElements);
    const elementsToCompare = normalizeUnstablePropertiesFromElements(elements);

    if (JSON.stringify(previousElementsToCompare) === JSON.stringify(elementsToCompare)) {
      return;
    }

    if (skipSubscription) {
      window.setTimeout(() => {
        skipSubscription = false;
      });

      return;
    }

    previousElements = elements;

    return elements;
  });

  document.addEventListener('mousemove', () => {
    isMouseMoving = true;
  });

  document.addEventListener('mouseup', () => {
    if (isMouseMoving) isMouseMoving = false;

    if (typeof mouseUpCallback === 'function') {
      mouseUpCallback();
      mouseUpCallback = null;
    }
  })

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

    updateUndoRedoStore();
  
    if (!undo) return;
  
    skipSubscription = true;
    useStore.getState().setElements(undo as Elements);
  };
  
  const redo = () => {
    const redo = undoRedo.redo();

    updateUndoRedoStore();
  
    if (!redo) return;
  
    skipSubscription = true;
    useStore.getState().setElements(redo);
  };

  return {
    undo,
    redo,
    undoRedoInstance: undoRedo,
  }
};
