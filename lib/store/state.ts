import { Selection } from 'd3-selection';
import { ZoomBehavior } from 'd3-zoom';
import create, { UseStore } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

import { Node, Edge, NodeExtent, SnapGrid, Transform, TranslateExtent, Dimensions, Point, ElementId, Elements } from '../types';
import { clampPosition, getDimensions } from '../utils';
import { isEdge } from '../utils/edge';
import { isNode } from '../utils/node';
import { parseEdge, parseNode } from '../utils/parse';

export type NodeValidator = (sourceNode: Node, targetNode: Node, connectingEdge: Edge) => { isValid: boolean, reason?: string };

export interface ReactFlowyState {
  width: number;
  height: number;
  transform: Transform;
  nodes: Node[];
  edges: Edge[];

  d3Zoom: ZoomBehavior<Element, unknown> | null;
  d3Selection: Selection<Element, unknown, null, undefined> | null;
  d3ZoomHandler: ((this: Element, event: any, d: unknown) => void) | undefined;
  minZoom: number;
  maxZoom: number;
  translateExtent: TranslateExtent;
  nodeExtent: NodeExtent;

  snapToGrid: boolean;
  snapGrid: SnapGrid;

  nodesDraggable: boolean;
  nodesConnectable: boolean;

  nodeValidators: Record<string, NodeValidator>;
}

export interface ReactFlowyActions {
  setElements: (propElements: Elements) => void;
  upsertNode: (node: Node) => void;
  setNodes: (nodes: Node[]) => void;
  upsertEdge: (edge: Edge) => void;
  setEdges: (edges: Edge[]) => void;
  unselectAllElements: () => void;
  setSelectedElementById: (id: string) => void;
  deleteElementById: (id: string) => void;
  updateNodeDimensions: (updates: NodeDimensionUpdate[]) => void;
  updateNodePos: (update: NodePosUpdate) => void;
  updateNodePosDiff: (update: NodeDiffUpdate) => void;
  setNodeExtent: (nodeExtent: NodeExtent) => void;
  updateTransform: (transform: Transform) => void;
  updateSize: (size: Dimensions) => void;
  initD3Zoom: (payload: InitD3ZoomPayload) => void;
  setMinZoom: (minZoom: number) => void;
  setMaxZoom: (maxZoom: number) => void;
  setTranslateExtent: (translateExtent: TranslateExtent) => void;
  translateTo: (translate: [number, number]) => void;
  zoomTo: (zoom: number) => void;
  setSnapToGrid: (snapToGrid: boolean) => void;
  setSnapGrid: (snapGrid: SnapGrid) => void;
  setInteractive: (isInteractive: boolean) => void;
  setNodesDraggable: (nodesDraggable: boolean) => void;
  setNodesConnectable: (nodesConnectable: boolean) => void;
  registerNodeValidator: (nodeType: string) => (validator: NodeValidator) => void;
}

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

const storeMapping: Record<string, undefined | UseStore<ReactFlowyState & ReactFlowyActions>> = {};

export const initializeStore = (id: string) => {
  if (id) {
    const useStore = useStoreById(id);

    if (useStore) return id;
  }

  const useStore = create<ReactFlowyState & ReactFlowyActions>((set, get) => ({
    // ==================== STATE ====================
  
    width: 0,
    height: 0,
    transform: [0, 0, 1],
    nodes: [],
    edges: [],
  
    d3Zoom: null,
    d3Selection: null,
    d3ZoomHandler: undefined,
    minZoom: 0.05,
    maxZoom: 2,
    translateExtent: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ],
  
    nodeExtent: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ],
  
    snapGrid: [15, 15],
    snapToGrid: false,
  
    nodesDraggable: true,
    nodesConnectable: true,
  
    nodeValidators: {},
  
    // ==================== ACIIONS ====================
  
    setElements: (propElements: Elements) => {
      const state = get();
      const nextElements: NextElements = {
        nextNodes: [],
        nextEdges: [],
      };
      const { nextNodes: newNodes, nextEdges: newEdges } = propElements.reduce((res, propElement): NextElements => {
        if (isNode(propElement)) {
          const storeNode = state.nodes.find((node) => node.id === propElement.id);
    
          if (storeNode) {
            const updatedNode: Node = {
              ...storeNode,
              ...propElement,
            };
    
            if (storeNode.position.x !== propElement.position.x || storeNode.position.y !== propElement.position.y) {
              updatedNode.position = propElement.position;
            }
    
            if (typeof propElement.type !== 'undefined' && propElement.type !== storeNode.type) {
              // we reset the elements dimensions here in order to force a re-calculation of the bounds.
              // When the type of a node changes it is possible that the number or positions of handles changes too.
              delete updatedNode.width;
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
    
      set(state => ({ ...state, nodes: newNodes, edges: newEdges }));
    },
    
    upsertNode: (node: Node) => {
      const state = get();
      const existingNode = state.nodes.find(n => n.id === node.id);
      
      if (!existingNode) {
        return set(state => ({ ...state, nodes: [...state.nodes, node] }));
      }
    
      set(state => ({ ...state, nodes: state.nodes.map(n => {
        if (n.id !== node.id) return n;
    
        return node;
      })}));
    },
  
    setNodes: (nodes: Node[]) => {
      set(state => ({ ...state, nodes }));
    },
    
    upsertEdge: (edge: Edge) => {
      const state = get();
      const existingEdge = state.edges.find(e => e.id === edge.id);
    
      if (!existingEdge) {
        return set(state => ({ ...state, edges: [...state.edges, edge] }));
      }
    
      set(state => ({ ...state, edges: state.edges.map(e => {
        if (e.id !== edge.id) return e;
    
        return edge;
      })}));
    },
  
    setEdges: (edges: Edge[]) => {
      set(state => ({ ...state, edges }));
    },
  
    unselectAllElements: () => {
      get().setSelectedElementById('');
    },
  
    setSelectedElementById: (id: string) => {
      let isAnElementUnselected = false;
      const state = get();
  
      const newNodes = state.nodes.map(node => {
        if (node.id !== id) {
          if (!node.isSelected) return node;
  
          isAnElementUnselected = true;
  
          return { ...node, isSelected: false };
        }
  
        return { ...node, isSelected: true };
      });
    
      const newEdges = state.edges.map(edge => {
        if (edge.id !== id) {
          if (!edge.isSelected) return edge;
  
          isAnElementUnselected = true;
  
          return { ...edge, isSelected: false };
        }
    
        return { ...edge, isSelected: true };
      })
  
      if (id === '' && !isAnElementUnselected) return;
  
      set(state => ({ ...state, nodes: newNodes, edges: newEdges }));
    },
  
    deleteElementById: (id: string) => {
      const state = get();
  
      const newNodes = state.nodes.filter(node => {
        if (node.id !== id) return true;
    
        const newEdges = state.edges.filter(edge => edge.source !== node.id && edge.target !== node.id);
  
        set(state => ({ ...state, edges: newEdges }));
    
        return false;
      });
    
      set(state => ({ ...state, nodes: newNodes, edges: state.edges.filter(edge => edge.id !== id) }));
    },
  
    updateNodeDimensions: (updates: NodeDimensionUpdate[]) => {
      const state = get();
  
      const newNodes = state.nodes.map(node => {
        const update = updates.find(u => u.id === node.id);
  
        if (update) {
          const dimensions = getDimensions(update.nodeElement);
          const doUpdate =
            dimensions.width &&
            dimensions.height &&
            (node.width !== dimensions.width || node.height !== dimensions.height || update.forceUpdate);
  
          if (doUpdate) {
            return {
              ...node,
              ...dimensions,
            };
          }
        }
  
        return node;
      });
  
      set(state => ({ ...state, nodes: newNodes }));
    },
    
    updateNodePos: ({ id, pos }: NodePosUpdate) => {
      let position: Point = pos;
      const state = get();
    
      if (state.snapToGrid) {
        const [gridSizeX, gridSizeY] = state.snapGrid;
    
        position = {
          x: gridSizeX * Math.round(pos.x / gridSizeX),
          y: gridSizeY * Math.round(pos.y / gridSizeY),
        };
      }
    
      const newNodes = state.nodes.map(node => {
        if (node.id === id) {
          return {
            ...node,
            position,
          };
        }
    
        return node;
      });
  
      set(state => ({ ...state, nodes: newNodes }));
    },  
  
    updateNodePosDiff: ({ id, diff, isDragging }: NodeDiffUpdate) => {
      const newNodes = get().nodes.map(node => {
        if (id === node.id) {
          const updatedNode = {
            ...node,
            isDragging,
          };
    
          if (diff) {
            updatedNode.position = {
              x: node.position.x + diff.x,
              y: node.position.y + diff.y,
            };
          }
    
          return updatedNode;
        }
    
        return node;
      });
  
      set(state => ({ ...state, nodes: newNodes }));
    },  
  
    setNodeExtent: (nodeExtent: NodeExtent) => {
      set(state => ({
        nodeExtent,
        nodes: state.nodes.map(node => ({
          ...node,
          position: clampPosition(node.position, nodeExtent),
        })),
      }))
    },  
  
    updateTransform: (transform: Transform) => set(state => ({ ...state, transform })),
  
    updateSize: (size: Dimensions) => set(state => ({ ...state, width: size.width || 500, height: size.height || 500 })),
  
    initD3Zoom: ({ d3Zoom, d3Selection, d3ZoomHandler, transform }: InitD3ZoomPayload) => set(state => ({
      ...state,
      d3Zoom,
      d3Selection,
      d3ZoomHandler,
      transform,
    })),
  
    setMinZoom: (minZoom: number) => {
      set(state => ({ ...state, minZoom }));
  
      const state = get();
  
      state.d3Zoom?.scaleExtent([minZoom, state.maxZoom]);
    },
  
    setMaxZoom: (maxZoom: number) => {
      set(state => ({ ...state, maxZoom }));
  
      const state = get();
  
      state.d3Zoom?.scaleExtent([state.minZoom, maxZoom]);
    },
  
    setTranslateExtent: (translateExtent: TranslateExtent) => {
      set(state => ({ ...state, translateExtent }));
  
      const state = get();

      state.d3Zoom?.translateExtent(translateExtent);
    },

    translateTo: (translateTo: [number, number]) => {
      const state = get();

      state.d3Zoom?.translateTo(state.d3Selection!, translateTo[0], translateTo[1]);
    },
  
    zoomTo: (zoom: number) => {
      const state = get();
  
      state.d3Zoom?.scaleTo(state.d3Selection!, zoom);
    },
  
    setSnapToGrid: (snapToGrid: boolean) => set(state => ({ ...state, snapToGrid })),
  
    setSnapGrid: (snapGrid: SnapGrid) => set(state => ({ ...state, snapGrid })),
  
    setInteractive: (isInteractive: boolean) => set(state => ({ ...state, nodesDraggable: isInteractive, nodesConnectable: isInteractive })),
  
    setNodesDraggable: (nodesDraggable: boolean) => set(state => ({ ...state, nodesDraggable })),
  
    setNodesConnectable: (nodesConnectable: boolean) => set(state => ({ ...state, nodesConnectable })),
  
    registerNodeValidator: (nodeType: string) => (validator: NodeValidator) =>
      set(state => ({ ...state, nodeValidators: { ...state.nodeValidators, [nodeType]: validator } })),
  }));

  const storeId = id || uuidv4();

  storeMapping[storeId] = useStore;

  return storeId;
}

export const useStoreById = (storeId: string) => {
  return storeMapping[storeId];
}
