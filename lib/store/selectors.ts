import { ReactFlowyState } from './state';

export const d3ZoomSelector = (state: ReactFlowyState) => state.d3Zoom;
export const d3SelectionSelector = (state: ReactFlowyState) => state.d3Selection;
export const d3ZoomHandlerSelector = (state: ReactFlowyState) => state.d3ZoomHandler;
export const widthSelector = (state: ReactFlowyState) => state.width;
export const heightSelector = (state: ReactFlowyState) => state.height;
export const minZoomSelector = (state: ReactFlowyState) => state.minZoom;
export const maxZoomSelector = (state: ReactFlowyState) => state.maxZoom;
export const transformSelector = (state: ReactFlowyState) => state.transform;
export const snapToGridSelector = (state: ReactFlowyState) => state.snapToGrid;
export const snapGridSelector = (state: ReactFlowyState) => state.snapGrid;
export const translateExtentSelector = (state: ReactFlowyState) => state.translateExtent;
export const nodesSelector = (state: ReactFlowyState) => state.nodes;
export const edgesSelector = (state: ReactFlowyState) => state.edges;
export const nodesDraggableSelector = (state: ReactFlowyState) => state.nodesDraggable;
export const nodesConnectableSelector = (state: ReactFlowyState) => state.nodesConnectable;
export const nodeValidatorsSelector = (state: ReactFlowyState) => state.nodeValidators;
