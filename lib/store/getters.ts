import { getSourceTargetNodes } from '../container/EdgeRenderer/utils';
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

export const getSourceNode = (edge: Edge): Node | undefined => {
  return useStore.getState().nodes.find(node => node.id === edge.source);
}

export const getTargetNode = (edge: Edge): Node | undefined => {
  return useStore.getState().nodes.find(node => node.id === edge.target);
}

export const getSourceAndTargetNodes = (edge: Edge) => {
  return getSourceTargetNodes(edge, useStore.getState().nodes);
}
