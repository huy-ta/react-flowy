import { Selection } from 'd3-selection';
import { ZoomBehavior } from 'd3-zoom';
import { useSnapshot, proxy } from 'valtio';
import { Node, Edge, NodeExtent, SnapGrid, Transform, TranslateExtent } from '../types';

export { useSnapshot };

export type NodeValidator = (sourceNode: Node, targetNode: Node, connectingEdge: Edge) => { isValid: boolean, reason?: string };

export interface ReactFlowState {
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

export const state = proxy<ReactFlowState>({
  width: 0,
  height: 0,
  transform: [0, 0, 1],
  nodes: [],
  edges: [],

  d3Zoom: null,
  d3Selection: null,
  d3ZoomHandler: undefined,
  minZoom: 0.5,
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
});
