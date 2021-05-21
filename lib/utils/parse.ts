import { clampPosition } from '.';
import { Edge, Elements, Node, NodeExtent } from '../types';

export const parseNode = (node: Node, nodeExtent: NodeExtent): Node => {
  return {
    ...node,
    id: node.id.toString(),
    type: node.type || 'default',
    __rf: {
      position: clampPosition(node.position, nodeExtent),
      width: null,
      height: null,
      isDragging: false,
    },
  };
};

export const parseEdge = (edge: Edge): Edge => {
  return {
    ...edge,
    source: edge.source.toString(),
    target: edge.target.toString(),
    id: edge.id.toString(),
    type: edge.type || 'default',
  };
};


export const parseElements = (nodes: Node[], edges: Edge[]): Elements => {
  return [
    ...nodes.map((node) => {
      const n = { ...node };

      n.position = n.__rf.position;

      delete n.__rf;
      return n;
    }),
    ...edges.map((e) => ({ ...e })),
  ];
};
