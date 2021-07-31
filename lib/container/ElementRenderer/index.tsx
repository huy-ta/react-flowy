import React, { useEffect, useRef } from 'react';

import ZoomPaneRenderer from '../ZoomPaneRenderer/ZoomPaneRenderer';
import NodeRenderer from '../NodeRenderer';
import EdgeRenderer from '../EdgeRenderer';
import useZoomPanHelper from '../../hooks/useZoomPanHelper';

import { FlowyExportObject, ReactFlowyProps } from '../ReactFlowy';

import { NodeTypesType, EdgeTypesType, Elements, Point } from '../../types';
import { ReactFlowyState, useStoreById } from '../../store/state';
import { pointToCanvasCoordinates } from '../../utils/coordinates';
import { parseElements } from '../../utils/parse';

export const onLoadProject = (state: ReactFlowyState) => {
  return (position: Point): Point => {
    const { transform, snapToGrid, snapGrid } = state;

    return pointToCanvasCoordinates(position, transform, snapToGrid, snapGrid);
  };
};

export const onLoadGetElements = (state: ReactFlowyState) => {
  return (): Elements => {
    const { nodes = [], edges = [] } = state;

    return parseElements(nodes, edges);
  };
};

export const onLoadToObject = (state: ReactFlowyState) => {
  return (): FlowyExportObject => {
    const { nodes = [], edges = [], transform } = state;

    return {
      elements: parseElements(nodes, edges),
      position: [transform[0], transform[1]],
      zoom: transform[2],
    };
  };
};

export interface ElementRendererProps extends Omit<ReactFlowyProps, 'elements'> {
  nodeTypes: NodeTypesType;
  edgeTypes: EdgeTypesType;
  snapToGrid: boolean;
  snapGrid: [number, number];
  defaultZoom: number;
  defaultPosition: [number, number];
  storeId: string;
}

const ElementRenderer = ({
  nodeTypes,
  edgeTypes,
  onMove,
  onMoveStart,
  onMoveEnd,
  onLoad,
  onElementClick,
  onNodeDoubleClick,
  onEdgeDoubleClick,
  onNodeMouseEnter,
  onNodeMouseMove,
  onNodeMouseLeave,
  onNodeContextMenu,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragStop,
  zoomActivationKeyCode,
  onElementsRemove,
  snapToGrid,
  snapGrid,
  nodesDraggable,
  nodesConnectable,
  minZoom,
  maxZoom,
  defaultZoom,
  defaultPosition,
  translateExtent,
  nodeExtent,
  markerEndId,
  zoomOnScroll,
  zoomOnPinch,
  panOnScroll,
  panOnScrollSpeed,
  panOnScrollMode,
  zoomOnDoubleClick,
  paneMoveable,
  onPaneClick,
  onPaneScroll,
  onPaneContextMenu,
  onEdgeContextMenu,
  onEdgeMouseEnter,
  onEdgeMouseMove,
  onEdgeMouseLeave,
  edgeUpdaterRadius,
  storeId,
}: ElementRendererProps) => {
  const useStore = useStoreById(storeId)!;
  const setMaxZoom = useStore(state => state.setMaxZoom);
  const setMinZoom = useStore(state => state.setMinZoom);
  const setNodeExtent = useStore(state => state.setNodeExtent);
  const setNodesConnectable = useStore(state => state.setNodesConnectable);
  const setNodesDraggable = useStore(state => state.setNodesDraggable);
  const setSnapGrid = useStore(state => state.setSnapGrid);
  const setSnapToGrid = useStore(state => state.setSnapToGrid);
  const setTranslateExtent = useStore(state => state.setTranslateExtent);
  const isInitialized = useRef<boolean>(false);
  const { zoomIn, zoomOut, zoomTo, transform, fitView, initialized } = useZoomPanHelper(storeId);

  useEffect(() => {
    if (!isInitialized.current && initialized) {
      if (onLoad) {
        onLoad({
          fitView: (params = { padding: 0.1 }) => fitView(params),
          zoomIn,
          zoomOut,
          zoomTo,
          setTransform: transform,
          project: onLoadProject(useStore.getState()),
          getElements: onLoadGetElements(useStore.getState()),
          toObject: onLoadToObject(useStore.getState()),
        });
      }

      isInitialized.current = true;
    }
  }, [onLoad, zoomIn, zoomOut, zoomTo, transform, fitView, initialized]);

  useEffect(() => {
    if (typeof snapToGrid !== 'undefined') {
      setSnapToGrid(snapToGrid);
    }
  }, [snapToGrid]);

  useEffect(() => {
    if (typeof snapGrid !== 'undefined') {
      setSnapGrid(snapGrid);
    }
  }, [snapGrid]);

  useEffect(() => {
    if (typeof nodesDraggable !== 'undefined') {
      setNodesDraggable(nodesDraggable);
    }
  }, [nodesDraggable]);

  useEffect(() => {
    if (typeof nodesConnectable !== 'undefined') {
      setNodesConnectable(nodesConnectable);
    }
  }, [nodesConnectable]);

  useEffect(() => {
    if (typeof minZoom !== 'undefined') {
      setMinZoom(minZoom);
    }
  }, [minZoom]);

  useEffect(() => {
    if (typeof maxZoom !== 'undefined') {
      setMaxZoom(maxZoom);
    }
  }, [maxZoom]);

  useEffect(() => {
    if (typeof translateExtent !== 'undefined') {
      setTranslateExtent(translateExtent);
    }
  }, [translateExtent]);

  useEffect(() => {
    if (typeof nodeExtent !== 'undefined') {
      setNodeExtent(nodeExtent);
    }
  }, [nodeExtent]);

  return (
    <ZoomPaneRenderer
      onPaneClick={onPaneClick}
      onPaneContextMenu={onPaneContextMenu}
      onPaneScroll={onPaneScroll}
      onElementsRemove={onElementsRemove}
      zoomActivationKeyCode={zoomActivationKeyCode}
      onMove={onMove}
      onMoveStart={onMoveStart}
      onMoveEnd={onMoveEnd}
      zoomOnScroll={zoomOnScroll}
      zoomOnPinch={zoomOnPinch}
      zoomOnDoubleClick={zoomOnDoubleClick}
      panOnScroll={panOnScroll}
      panOnScrollSpeed={panOnScrollSpeed}
      panOnScrollMode={panOnScrollMode}
      paneMoveable={paneMoveable}
      defaultPosition={defaultPosition}
      defaultZoom={defaultZoom}
      translateExtent={translateExtent}
      storeId={storeId}
    >
      <NodeRenderer
        nodeTypes={nodeTypes}
        onElementClick={onElementClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseMove={onNodeMouseMove}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDragStop={onNodeDragStop}
        onNodeDrag={onNodeDrag}
        onNodeDragStart={onNodeDragStart}
        snapToGrid={snapToGrid}
        snapGrid={snapGrid}
        storeId={storeId}
      />
      <EdgeRenderer
        edgeTypes={edgeTypes}
        onElementClick={onElementClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        markerEndId={markerEndId}
        onEdgeContextMenu={onEdgeContextMenu}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseMove={onEdgeMouseMove}
        onEdgeMouseLeave={onEdgeMouseLeave}
        edgeUpdaterRadius={edgeUpdaterRadius}
        storeId={storeId}
      />
    </ZoomPaneRenderer>
  );
};

ElementRenderer.displayName = 'ElementRenderer';

export default React.memo(ElementRenderer);
