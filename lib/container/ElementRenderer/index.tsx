import React, { useEffect, useRef, memo } from 'react';
import { useSnapshot } from 'valtio';

import ZoomPaneRenderer from '../ZoomPaneRenderer/ZoomPaneRenderer';
import NodeRenderer from '../NodeRenderer';
import EdgeRenderer from '../EdgeRenderer';
import { onLoadProject, onLoadGetElements, onLoadToObject } from '../../utils/graph';
import useZoomPanHelper from '../../hooks/useZoomPanHelper';

import { ReactFlowProps } from '../ReactFlow';

import { NodeTypesType, EdgeTypesType, ReactFlowState } from '../../types';
import { setMaxZoom, setMinZoom, setNodeExtent, setNodesConnectable, setNodesDraggable, setSnapGrid, setSnapToGrid, setTranslateExtent } from '../../store/actions';
import { state } from '../../store/state';

export interface ElementRendererProps extends Omit<ReactFlowProps, 'elements'> {
  nodeTypes: NodeTypesType;
  edgeTypes: EdgeTypesType;
  snapToGrid: boolean;
  snapGrid: [number, number];
  onlyRenderVisibleElements: boolean;
  defaultZoom: number;
  defaultPosition: [number, number];
  arrowHeadColor: string;
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
  onlyRenderVisibleElements,
  nodesDraggable,
  nodesConnectable,
  minZoom,
  maxZoom,
  defaultZoom,
  defaultPosition,
  translateExtent,
  nodeExtent,
  arrowHeadColor,
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
}: ElementRendererProps) => {
  const isInitialized = useRef<boolean>(false);
  const snap = useSnapshot(state);
  const { zoomIn, zoomOut, zoomTo, transform, fitView, initialized } = useZoomPanHelper();

  useEffect(() => {
    if (!isInitialized.current && initialized) {
      if (onLoad) {
        onLoad({
          fitView: (params = { padding: 0.1 }) => fitView(params),
          zoomIn,
          zoomOut,
          zoomTo,
          setTransform: transform,
          project: onLoadProject(snap as ReactFlowState),
          getElements: onLoadGetElements(snap as ReactFlowState),
          toObject: onLoadToObject(snap as ReactFlowState),
        });
      }

      isInitialized.current = true;
    }
  }, [onLoad, zoomIn, zoomOut, zoomTo, transform, fitView, initialized, snap]);

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
        onlyRenderVisibleElements={onlyRenderVisibleElements}
      />
      <EdgeRenderer
        edgeTypes={edgeTypes}
        onElementClick={onElementClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        arrowHeadColor={arrowHeadColor}
        markerEndId={markerEndId}
        onlyRenderVisibleElements={onlyRenderVisibleElements}
        onEdgeContextMenu={onEdgeContextMenu}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseMove={onEdgeMouseMove}
        onEdgeMouseLeave={onEdgeMouseLeave}
        edgeUpdaterRadius={edgeUpdaterRadius}
      />
    </ZoomPaneRenderer>
  );
};

ElementRenderer.displayName = 'ElementRenderer';

export default memo(ElementRenderer);
