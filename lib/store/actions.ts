import { Selection } from 'd3-selection';
import { ZoomBehavior } from 'd3-zoom';
import {
  Elements,
  ElementId,
  Transform,
  Dimensions,
  TranslateExtent,
  SnapGrid,
  NodeExtent,
  Node,
  Edge,
  Point,
} from '../types';
import { clampPosition, getDimensions } from '../utils';
import { isEdge } from '../utils/edge';
import { isNode } from '../utils/node';
import { parseEdge, parseNode } from '../utils/parse';
import { NodeValidator, state } from './state';

type NextElements = {
  nextNodes: Node[];
  nextEdges: Edge[];
};

export type NodePosUpdate = {
  id: ElementId;
  pos: Point;
};

export type NodeDiffUpdate = {
  id?: ElementId;
  diff?: Point;
  isDragging?: boolean;
};

export type NodeDimensionUpdate = {
  id: ElementId;
  nodeElement: HTMLDivElement;
  forceUpdate?: boolean;
};

export type InitD3ZoomPayload = {
  d3Zoom: ZoomBehavior<Element, unknown>;
  d3Selection: Selection<Element, unknown, null, undefined>;
  d3ZoomHandler: ((this: Element, event: any, d: unknown) => void) | undefined;
  transform: Transform;
};

export const setElements = (propElements: Elements) => {
  const nextElements: NextElements = {
    nextNodes: [],
    nextEdges: [],
  };
  const { nextNodes, nextEdges } = propElements.reduce((res, propElement): NextElements => {
    if (isNode(propElement)) {
      const storeNode = state.nodes.find((node) => node.id === propElement.id);

      if (storeNode) {
        const updatedNode: Node = {
          ...storeNode,
          ...propElement,
        };

        if (storeNode.position.x !== propElement.position.x || storeNode.position.y !== propElement.position.y) {
          updatedNode.__rf.position = propElement.position;
        }

        if (typeof propElement.type !== 'undefined' && propElement.type !== storeNode.type) {
          // we reset the elements dimensions here in order to force a re-calculation of the bounds.
          // When the type of a node changes it is possible that the number or positions of handles changes too.
          updatedNode.__rf.width = null;
        }

        res.nextNodes.push(updatedNode);
      } else {
        res.nextNodes.push(parseNode(propElement, state.nodeExtent));
      }
    } else if (isEdge(propElement)) {
      const storeEdge = state.edges.find(se => se.id === propElement.id);

      if (storeEdge) {
        res.nextEdges.push({
          ...storeEdge,
          ...propElement,
        });
      } else {
        res.nextEdges.push(parseEdge(propElement));
      }
    }

    return res;
  }, nextElements);

  state.nodes = nextNodes;
  state.edges = nextEdges;
};

export const upsertNode = (node: Node) => {
  const existingNode = state.nodes.find(n => n.id === node.id);
  
  if (!existingNode) {
    state.nodes.push(node);

    return;
  }

  state.nodes = state.nodes.map(n => {
    if (n.id !== node.id) return n;

    return node;
  });
}

export const upsertEdge = (edge: Edge) => {
  const existingEdge = state.edges.find(e => e.id === edge.id);

  if (!existingEdge) {
    state.edges = [...state.edges, edge];

    return;
  }

  state.edges = state.edges.map(e => {
    if (e.id !== edge.id) return e;

    return edge;
  });
}

export const setEdges = (edges: Edge[]) => {
  state.edges = edges;
}

export const setSelectedElementById = (id: string) => {
  state.nodes = state.nodes.map(node => {
    if (node.id !== id) {
      if (node.isSelected) node.isSelected = false;

      return node;
    }

    node.isSelected = true;

    return node;
  });

  state.edges = state.edges.map(edge => {
    if (edge.id !== id) {
      if (edge.isSelected) edge.isSelected = false;

      return edge;
    }

    edge.isSelected = true;

    return edge;
  })
}

export const unselectAllElements = () => {
  setSelectedElementById('');
}

export const deleteElementById = (id: string) => {
  state.nodes = state.nodes.filter(node => {
    if (node.id !== id) return true;

    state.edges = state.edges.filter(edge => edge.source !== node.id && edge.target !== node.id);

    return false;
  });

  state.edges = state.edges.filter(edge => edge.id !== id);
}

export const updateNodeDimensions = (updates: NodeDimensionUpdate[]) => {
  const updatedNodes = state.nodes.map((node) => {
    const update = updates.find(u => u.id === node.id);

    if (update) {
      const dimensions = getDimensions(update.nodeElement);
      const doUpdate =
        dimensions.width &&
        dimensions.height &&
        (node.__rf.width !== dimensions.width || node.__rf.height !== dimensions.height || update.forceUpdate);

      if (doUpdate) {
        return {
          ...node,
          __rf: {
            ...node.__rf,
            ...dimensions,
          },
        };
      }
    }

    return node;
  });

  state.nodes = updatedNodes;
}

export const updateNodePos = (payload: NodePosUpdate) => {
  const { id, pos } = payload;
  let position: Point = pos;

  if (state.snapToGrid) {
    const [gridSizeX, gridSizeY] = state.snapGrid;

    position = {
      x: gridSizeX * Math.round(pos.x / gridSizeX),
      y: gridSizeY * Math.round(pos.y / gridSizeY),
    };
  }

  const nextNodes = state.nodes.map(node => {
    if (node.id === id) {
      return {
        ...node,
        __rf: {
          ...node.__rf,
          position,
        },
      };
    }

    return node;
  });

  state.nodes = nextNodes;
}

export const updateNodePosDiff = (payload: NodeDiffUpdate) => {
  const { id, diff, isDragging } = payload;

  const nextNodes = state.nodes.map(node => {
    if (id === node.id) {
      const updatedNode = {
        ...node,
        __rf: {
          ...node.__rf,
          isDragging,
        },
      };

      if (diff) {
        updatedNode.__rf.position = {
          x: node.__rf.position.x + diff.x,
          y: node.__rf.position.y + diff.y,
        };
      }

      return updatedNode;
    }

    return node;
  });

  state.nodes = nextNodes;
}

export const updateTransform = (transform: Transform) => {
  state.transform = transform;
}

export const updateSize = (size: Dimensions) => {
  state.width = size.width || 500;
  state.height = size.height || 500;
};

export const initD3Zoom = (payload: InitD3ZoomPayload) => {
  const { d3Zoom, d3Selection, d3ZoomHandler, transform } = payload;

  state.d3Zoom = d3Zoom;
  state.d3Selection = d3Selection;
  state.d3ZoomHandler = d3ZoomHandler;
  state.transform = transform;
}

export const setMinZoom = (minZoom: number) => {
  state.minZoom = minZoom;

  state.d3Zoom?.scaleExtent([minZoom, state.maxZoom]);
}

export const setMaxZoom = (maxZoom: number) => {
  state.maxZoom = maxZoom;

  state.d3Zoom?.scaleExtent([state.minZoom, maxZoom]);
}

export const setTranslateExtent = (translateExtent: TranslateExtent) => {
  state.translateExtent = translateExtent;

  state.d3Zoom?.translateExtent(translateExtent);
}

export const setSnapToGrid = (snapToGrid: boolean) => {
  state.snapToGrid = snapToGrid;
}

export const setSnapGrid = (snapGrid: SnapGrid) => {
  state.snapGrid = snapGrid;
}

export const setInteractive = (isInteractive: boolean) => {
  state.nodesDraggable = isInteractive;
  state.nodesConnectable = isInteractive;
}

export const setNodesDraggable = (nodesDraggable: boolean) => {
  state.nodesDraggable = nodesDraggable;
}

export const setNodesConnectable = (nodesConnectable: boolean) => {
  state.nodesConnectable = nodesConnectable;
}

export const setNodeExtent = (nodeExtent: NodeExtent) => {
  state.nodeExtent = nodeExtent;
  state.nodes = state.nodes.map(node => ({
    ...node,
    __rf: {
      ...node.__rf,
      position: clampPosition(node.__rf.position, nodeExtent),
    },
  }));
}

export const registerNodeValidator = (nodeType: string) => (validator: NodeValidator) => {
  state.nodeValidators[nodeType] = validator;
}
