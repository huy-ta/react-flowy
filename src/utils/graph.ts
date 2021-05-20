import { Store } from 'redux';

import { clampPosition, clamp } from '../utils';

import {
  ElementId,
  Node,
  Edge,
  Elements,
  Transform,
  XYPosition,
  Rect,
  Box,
  FlowExportObject,
  ReactFlowState,
  NodeExtent,
} from '../types';

export const isEdge = (element: Node | Edge): element is Edge =>
  'id' in element && 'source' in element && 'target' in element;

export const isNode = (element: Node | Edge): element is Node =>
  'id' in element && !('source' in element) && !('target' in element);

export const getOutgoers = (node: Node, elements: Elements): Node[] => {
  if (!isNode(node)) {
    return [];
  }

  const outgoerIds = elements.filter((e) => isEdge(e) && e.source === node.id).map((e) => (e as Edge).target);
  return elements.filter((e) => outgoerIds.includes(e.id)) as Node[];
};

export const getIncomers = (node: Node, elements: Elements): Node[] => {
  if (!isNode(node)) {
    return [];
  }

  const incomersIds = elements.filter((e) => isEdge(e) && e.target === node.id).map((e) => (e as Edge).source);
  return elements.filter((e) => incomersIds.includes(e.id)) as Node[];
};

export const removeElements = (elementsToRemove: Elements, elements: Elements): Elements => {
  const nodeIdsToRemove = elementsToRemove.map((n) => n.id);

  return elements.filter((element) => {
    const edgeElement = element as Edge;
    return !(
      nodeIdsToRemove.includes(element.id) ||
      nodeIdsToRemove.includes(edgeElement.target) ||
      nodeIdsToRemove.includes(edgeElement.source)
    );
  });
};

export const getEdgeId = ({ source, target }: Edge): ElementId =>
  `reactflow__edge-${source}-${target}}`;

const doesEdgeExist = (edge: Edge, elements: Elements) => {
  return elements.some(
    (el) =>
      isEdge(el) &&
      el.source === edge.source &&
      el.target === edge.target
  );
};

export const addEdge = (edgeParams: Edge, elements: Elements): Elements => {
  if (!edgeParams.source) {
    console.warn("Can't create edge. An edge needs a source.");

    return elements;
  }

  if (!edgeParams.id) {
    console.warn("Can't create edge. An edge needs an id");

    return elements;
  }

  const edge = { ...edgeParams };

  if (doesEdgeExist(edge, elements)) {
    return elements;
  }

  return elements.concat(edge);
};

export const addEdges = (edges: Edge[], elements: Elements): Elements => {
  let newElements: Elements = elements;

  for (let edge of edges) {
    newElements = addEdge(edge, newElements);
  }

  return newElements;
};

export const pointToRendererPoint = (
  { x, y }: XYPosition,
  [tx, ty, tScale]: Transform,
  snapToGrid: boolean,
  [snapX, snapY]: [number, number]
): XYPosition => {
  const position: XYPosition = {
    x: (x - tx) / tScale,
    y: (y - ty) / tScale,
  };

  if (snapToGrid) {
    return {
      x: snapX * Math.round(position.x / snapX),
      y: snapY * Math.round(position.y / snapY),
    };
  }

  return position;
};

export const onLoadProject = (state: ReactFlowState) => {
  return (position: XYPosition): XYPosition => {
    const { transform, snapToGrid, snapGrid } = state;

    return pointToRendererPoint(position, transform, snapToGrid, snapGrid);
  };
};

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

const getBoundsOfBoxes = (box1: Box, box2: Box): Box => ({
  x: Math.min(box1.x, box2.x),
  y: Math.min(box1.y, box2.y),
  x2: Math.max(box1.x2, box2.x2),
  y2: Math.max(box1.y2, box2.y2),
});

export const rectToBox = ({ x, y, width, height }: Rect): Box => ({
  x,
  y,
  x2: x + width,
  y2: y + height,
});

export const boxToRect = ({ x, y, x2, y2 }: Box): Rect => ({
  x,
  y,
  width: x2 - x,
  height: y2 - y,
});

export const getBoundsofRects = (rect1: Rect, rect2: Rect): Rect =>
  boxToRect(getBoundsOfBoxes(rectToBox(rect1), rectToBox(rect2)));

export const getRectOfNodes = (nodes: Node[]): Rect => {
  const box = nodes.reduce(
    (currBox, { __rf: { position, width, height } = {} }) =>
      getBoundsOfBoxes(currBox, rectToBox({ ...position, width, height })),
    { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity }
  );

  return boxToRect(box);
};

export const graphPosToZoomedPos = ({ x, y }: XYPosition, [tx, ty, tScale]: Transform): XYPosition => ({
  x: x * tScale + tx,
  y: y * tScale + ty,
});

export const getNodesInside = (
  nodes: Node[],
  rect: Rect,
  [tx, ty, tScale]: Transform = [0, 0, 1],
  partially: boolean = false
): Node[] => {
  const rBox = rectToBox({
    x: (rect.x - tx) / tScale,
    y: (rect.y - ty) / tScale,
    width: rect.width / tScale,
    height: rect.height / tScale,
  });

  return nodes.filter(({ __rf: { position, width, height, isDragging } }) => {
    const nBox = rectToBox({ ...position, width, height });
    const xOverlap = Math.max(0, Math.min(rBox.x2, nBox.x2) - Math.max(rBox.x, nBox.x));
    const yOverlap = Math.max(0, Math.min(rBox.y2, nBox.y2) - Math.max(rBox.y, nBox.y));
    const overlappingArea = Math.ceil(xOverlap * yOverlap);

    if (width === null || height === null || isDragging) {
      // nodes are initialized with width and height = null
      return true;
    }

    if (partially) {
      return overlappingArea > 0;
    }

    const area = width * height;

    return overlappingArea >= area;
  });
};

export const getConnectedEdges = (nodes: Node[], edges: Edge[]): Edge[] => {
  const nodeIds = nodes.map((node) => node.id);

  return edges.filter((edge) => nodeIds.includes(edge.source) || nodeIds.includes(edge.target));
};

const parseElements = (nodes: Node[], edges: Edge[]): Elements => {
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

export const onLoadGetElements = (state: ReactFlowState) => {
  return (): Elements => {
    const { nodes = [], edges = [] } = state;

    return parseElements(nodes, edges);
  };
};

export const onLoadToObject = (state: ReactFlowState) => {
  return (): FlowExportObject => {
    const { nodes = [], edges = [], transform } = state;

    return {
      elements: parseElements(nodes, edges),
      position: [transform[0], transform[1]],
      zoom: transform[2],
    };
  };
};

export const getTransformForBounds = (
  bounds: Rect,
  width: number,
  height: number,
  minZoom: number,
  maxZoom: number,
  padding: number = 0.1
): Transform => {
  const xZoom = width / (bounds.width * (1 + padding));
  const yZoom = height / (bounds.height * (1 + padding));
  const zoom = Math.min(xZoom, yZoom);
  const clampedZoom = clamp(zoom, minZoom, maxZoom);
  const boundsCenterX = bounds.x + bounds.width / 2;
  const boundsCenterY = bounds.y + bounds.height / 2;
  const x = width / 2 - boundsCenterX * clampedZoom;
  const y = height / 2 - boundsCenterY * clampedZoom;

  return [x, y, clampedZoom];
};
