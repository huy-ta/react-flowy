import { ComponentType } from 'react';

import wrapEdge from '../../components/Edges/wrapEdge';
import { rectToBox } from '../../utils/graph';

import {
  EdgeTypesType,
  EdgeProps,
  Node,
  XYPosition,
  Transform,
  Edge,
} from '../../types';

export function createEdgeTypes(edgeTypes: EdgeTypesType): EdgeTypesType {
  const wrappedTypes = {} as EdgeTypesType;

  return Object.keys(edgeTypes)
    .reduce((res, key) => {
      res[key] = wrapEdge((edgeTypes[key]) as ComponentType<EdgeProps>);

      return res;
    }, wrappedTypes);
}

interface IsEdgeVisibleParams {
  sourcePos: XYPosition;
  targetPos: XYPosition;
  width: number;
  height: number;
  transform: Transform;
}

export function isEdgeVisible({ sourcePos, targetPos, width, height, transform }: IsEdgeVisibleParams): boolean {
  const edgeBox = {
    x: Math.min(sourcePos.x, targetPos.x),
    y: Math.min(sourcePos.y, targetPos.y),
    x2: Math.max(sourcePos.x, targetPos.x),
    y2: Math.max(sourcePos.y, targetPos.y),
  };

  if (edgeBox.x === edgeBox.x2) {
    edgeBox.x2 += 1;
  }

  if (edgeBox.y === edgeBox.y2) {
    edgeBox.y2 += 1;
  }

  const viewBox = rectToBox({
    x: (0 - transform[0]) / transform[2],
    y: (0 - transform[1]) / transform[2],
    width: width / transform[2],
    height: height / transform[2],
  });

  const xOverlap = Math.max(0, Math.min(viewBox.x2, edgeBox.x2) - Math.max(viewBox.x, edgeBox.x));
  const yOverlap = Math.max(0, Math.min(viewBox.y2, edgeBox.y2) - Math.max(viewBox.y, edgeBox.y));
  const overlappingArea = Math.ceil(xOverlap * yOverlap);

  return overlappingArea > 0;
}

type SourceTargetNode = {
  sourceNode: Node | null;
  targetNode: Node | null;
};

export const getSourceTargetNodes = (edge: Edge, nodes: Node[]): SourceTargetNode => {
  return nodes.reduce(
    (res, node) => {
      if (node.id === edge.source) {
        res.sourceNode = node;
      }
      if (node.id === edge.target) {
        res.targetNode = node;
      }
      return res;
    },
    { sourceNode: null, targetNode: null } as SourceTargetNode
  );
};
