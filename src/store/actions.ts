import { createAction } from './utils';

import {
  Elements,
  NodeDimensionUpdate,
  NodePosUpdate,
  NodeDiffUpdate,
  Transform,
  Dimensions,
  InitD3ZoomPayload,
  TranslateExtent,
  SnapGrid,
  NodeExtent,
} from '../types';

import * as constants from './contants';

export const setElements = (elements: Elements) => createAction(constants.SET_ELEMENTS, elements);

export const updateNodeDimensions = (updates: NodeDimensionUpdate[]) =>
  createAction(constants.UPDATE_NODE_DIMENSIONS, updates);

export const updateNodePos = (payload: NodePosUpdate) => createAction(constants.UPDATE_NODE_POS, payload);

export const updateNodePosDiff = (payload: NodeDiffUpdate) => createAction(constants.UPDATE_NODE_POS_DIFF, payload);

export const updateTransform = (transform: Transform) => createAction(constants.UPDATE_TRANSFORM, { transform });

export const updateSize = (size: Dimensions) =>
  createAction(constants.UPDATE_SIZE, {
    width: size.width || 500,
    height: size.height || 500,
  });

export const initD3Zoom = (payload: InitD3ZoomPayload) => createAction(constants.INIT_D3ZOOM, payload);

export const setMinZoom = (minZoom: number) => createAction(constants.SET_MINZOOM, minZoom);

export const setMaxZoom = (maxZoom: number) => createAction(constants.SET_MAXZOOM, maxZoom);

export const setTranslateExtent = (translateExtent: TranslateExtent) =>
  createAction(constants.SET_TRANSLATEEXTENT, translateExtent);

export const setSnapToGrid = (snapToGrid: boolean) => createAction(constants.SET_SNAPTOGRID, { snapToGrid });

export const setSnapGrid = (snapGrid: SnapGrid) => createAction(constants.SET_SNAPGRID, { snapGrid });

export const setInteractive = (isInteractive: boolean) =>
  createAction(constants.SET_INTERACTIVE, {
    nodesDraggable: isInteractive,
    nodesConnectable: isInteractive,
  });

export const setNodesDraggable = (nodesDraggable: boolean) =>
  createAction(constants.SET_NODES_DRAGGABLE, { nodesDraggable });

export const setNodesConnectable = (nodesConnectable: boolean) =>
  createAction(constants.SET_NODES_CONNECTABLE, { nodesConnectable });

export const setNodeExtent = (nodeExtent: NodeExtent) => createAction(constants.SET_NODE_EXTENT, nodeExtent);

export type ReactFlowAction = ReturnType<
  | typeof setElements
  | typeof updateNodeDimensions
  | typeof updateNodePos
  | typeof updateNodePosDiff
  | typeof updateTransform
  | typeof updateSize
  | typeof initD3Zoom
  | typeof setMinZoom
  | typeof setMaxZoom
  | typeof setTranslateExtent
  | typeof setSnapToGrid
  | typeof setSnapGrid
  | typeof setInteractive
  | typeof setNodesDraggable
  | typeof setNodesConnectable
  | typeof setNodeExtent
>;
