import { Edge, Node } from '../types';
import { useStore } from './state'

export const getSelectedElement = (): Node | Edge | undefined => {
  const state = useStore.getState();

  return [...state.nodes, ...state.edges].find(element => element.isSelected);
}

export const getOutEdges = (node: Node): Edge[] => {
  return useStore.getState().edges.filter(edge => edge.source === node.id);
}

export const getInEdges = (node: Node): Edge[] => {
  return useStore.getState().edges.filter(edge => edge.target === node.id);
}
