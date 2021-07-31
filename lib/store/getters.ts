import { getSourceTargetNodes } from '../container/EdgeRenderer/utils';
import { Edge, Node } from '../types';

export const getSelectedElement = (elements: (Node & Edge)[]): Node | Edge | undefined => {
  return elements.find(element => element.isSelected);
}

export const getOutgoingEdges = (edges: Edge[]) => (node: Node): Edge[] => {
  return edges.filter(edge => edge.source === node.id);
}

export const getIncomingEdges = (edges: Edge[]) => (node: Node): Edge[] => {
  return edges.filter(edge => edge.target === node.id);
}

export const getSourceNode = (nodes: Node[]) => (edge: Edge): Node | undefined => {
  return nodes.find(node => node.id === edge.source);
}

export const getTargetNode = (nodes: Node[]) => (edge: Edge): Node | undefined => {
  return nodes.find(node => node.id === edge.target);
}

export const getSourceAndTargetNodes = (nodes: Node[]) => (edge: Edge) => {
  return getSourceTargetNodes(edge, nodes);
}
