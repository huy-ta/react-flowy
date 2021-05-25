import { useStore } from '../../../store/state';
import { Node, Edge, Elements } from '../../../types';

const normalizeUnstablePropertiesFromElements = (elements: Node[] | Edge[] | Elements) => {
  const elementsWithUnstablePropertiesExcluded = (elements as Node[])
    .map(({ width, height, ...node }) => node)
    .filter(node => !node.isDragging && !node.isSelected);

  return (elementsWithUnstablePropertiesExcluded as unknown as Edge[])
    .filter(edge => !edge.isDragging && !edge.isSelected);
};

export type ElementChangeListener = (elements: Elements) => void;

let listeners: ElementChangeListener[] = []; 
let previousElements: Elements = [];

useStore.subscribe((elements: Elements | undefined) => {
  if (!elements) return;

  listeners.forEach(listener => listener(elements));
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

  previousElements = elements;

  return elements;
});

export const subscribeToFinalElementChanges = (listener: ElementChangeListener) => {
  listeners.push(listener);

  return function unsubscribe() {
    listeners = listeners.filter(l => l !== listener);
  };
};
