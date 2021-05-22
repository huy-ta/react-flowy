import { Edge, Node } from '../types';
import { state } from './state'

export const getSelectedElement = (): Node | Edge | undefined => {
  return [...state.nodes, ...state.edges].find(element => element.isSelected);
}

export const getOutEdges = (node: Node): Edge[] => {
  return state.edges.filter(edge => edge.source === node.id);
}

export const getInEdges = (node: Node): Edge[] => {
  return state.edges.filter(edge => edge.target === node.id);
}
