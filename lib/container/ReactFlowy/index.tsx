import React, { useMemo, useCallback, HTMLAttributes, MouseEvent, WheelEvent } from 'react';
import cc from 'classcat';

import ElementRenderer from '../ElementRenderer';
import { createNodeTypes } from '../NodeRenderer/utils';
import { createEdgeTypes } from '../EdgeRenderer/utils';
import {
  Elements,
  NodeTypesType,
  EdgeTypesType,
  Node,
  Edge,
  Point,
  FlowTransform,
  TranslateExtent,
  KeyCode,
  PanOnScrollMode,
  NodeExtent,
  DragDelta,
} from '../../types';

import '../../style.css';
import '../../theme-default.css';
import { FitViewFunc } from '../../hooks/useZoomPanHelper';

export type FlowyExportObject<T = any> = {
  elements: Elements<T>;
  position: [number, number];
  zoom: number;
};

export type ProjectFunc = (point: Point) => Point;
export type ToObjectFunc<T = any> = () => FlowyExportObject<T>;

export type OnLoadParams<T = any> = {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (zoomLevel: number) => void;
  fitView: FitViewFunc;
  project: ProjectFunc;
  getElements: () => Elements<T>;
  setTransform: (transform: FlowTransform) => void;
  toObject: ToObjectFunc<T>;
};

export type OnLoadFunc<T = any> = (params: OnLoadParams<T>) => void;

export interface ReactFlowyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onLoad'> {
  onBackgroundClick?: (event: MouseEvent) => void;
  onElementClick?: (event: MouseEvent, element: Node | Edge) => void;
  onElementsRemove?: (elements: Elements) => void;
  onNodeDoubleClick?: (event: MouseEvent, node: Node) => void;
  onNodeMouseEnter?: (event: MouseEvent, node: Node) => void;
  onNodeMouseMove?: (event: MouseEvent, node: Node) => void;
  onNodeMouseLeave?: (event: MouseEvent, node: Node) => void;
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: MouseEvent, node: Node) => void;
  onNodeDrag?: (event: MouseEvent, node: Node, dragDelta: DragDelta) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node) => void;
  onLoad?: OnLoadFunc;
  onMove?: (flowTransform?: FlowTransform) => void;
  onMoveStart?: (flowTransform?: FlowTransform) => void;
  onMoveEnd?: (flowTransform?: FlowTransform) => void;
  onPaneScroll?: (event?: WheelEvent) => void;
  onPaneClick?: (event: MouseEvent) => void;
  onPaneContextMenu?: (event: MouseEvent) => void;
  nodeTypes: NodeTypesType;
  edgeTypes: EdgeTypesType;
  zoomActivationKeyCode?: KeyCode;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  paneMoveable?: boolean;
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
  defaultPosition?: [number, number];
  translateExtent?: TranslateExtent;
  nodeExtent?: NodeExtent;
  markerEndId?: string;
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  panOnScroll?: boolean;
  panOnScrollSpeed?: number;
  panOnScrollMode?: PanOnScrollMode;
  zoomOnDoubleClick?: boolean;
  onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: MouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: MouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: MouseEvent, edge: Edge) => void;
  onEdgeDoubleClick?: (event: MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
  nodeTypesId?: string;
  edgeTypesId?: string;
}

export type ReactFlowRefType = HTMLDivElement;

const ReactFlowy = React.forwardRef<ReactFlowRefType, ReactFlowyProps>(
  (
    {
      className,
      nodeTypes,
      edgeTypes,
      onBackgroundClick,
      onElementClick,
      onLoad,
      onMove,
      onMoveStart,
      onMoveEnd,
      onElementsRemove,
      onNodeMouseEnter,
      onNodeMouseMove,
      onNodeMouseLeave,
      onNodeContextMenu,
      onNodeDoubleClick,
      onNodeDragStart,
      onNodeDrag,
      onNodeDragStop,
      zoomActivationKeyCode = 'Meta',
      snapToGrid = false,
      snapGrid = [15, 15],
      nodesDraggable,
      nodesConnectable,
      minZoom,
      maxZoom,
      defaultZoom = 1,
      defaultPosition = [0, 0],
      translateExtent,
      nodeExtent,
      markerEndId,
      zoomOnScroll = true,
      zoomOnPinch = true,
      panOnScroll = false,
      panOnScrollSpeed = 0.5,
      panOnScrollMode = PanOnScrollMode.Free,
      zoomOnDoubleClick = true,
      paneMoveable = true,
      onPaneClick,
      onPaneScroll,
      onPaneContextMenu,
      children,
      onEdgeContextMenu,
      onEdgeDoubleClick,
      onEdgeMouseEnter,
      onEdgeMouseMove,
      onEdgeMouseLeave,
      edgeUpdaterRadius = 10,
      ...rest
    },
    ref
  ) => {
    const nodeTypesParsed = useMemo(() => createNodeTypes(nodeTypes), []);
    const edgeTypesParsed = useMemo(() => createEdgeTypes(edgeTypes), []);
    const reactFlowClasses = cc(['react-flowy', className]);

    const handleClick = useCallback((e: MouseEvent) => {
      if (typeof onBackgroundClick === 'function') onBackgroundClick(e);
    }, []);

    return (
      <div {...rest} ref={ref} className={reactFlowClasses} onClick={handleClick}>
        <ElementRenderer
          onLoad={onLoad}
          onMove={onMove}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          onElementClick={onElementClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseMove={onNodeMouseMove}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypesParsed}
          edgeTypes={edgeTypesParsed}
          onElementsRemove={onElementsRemove}
          zoomActivationKeyCode={zoomActivationKeyCode}
          snapToGrid={snapToGrid}
          snapGrid={snapGrid}
          nodesDraggable={nodesDraggable}
          nodesConnectable={nodesConnectable}
          minZoom={minZoom}
          maxZoom={maxZoom}
          defaultZoom={defaultZoom}
          defaultPosition={defaultPosition}
          translateExtent={translateExtent}
          nodeExtent={nodeExtent}
          markerEndId={markerEndId}
          zoomOnScroll={zoomOnScroll}
          zoomOnPinch={zoomOnPinch}
          zoomOnDoubleClick={zoomOnDoubleClick}
          panOnScroll={panOnScroll}
          panOnScrollSpeed={panOnScrollSpeed}
          panOnScrollMode={panOnScrollMode}
          paneMoveable={paneMoveable}
          onPaneClick={onPaneClick}
          onPaneScroll={onPaneScroll}
          onPaneContextMenu={onPaneContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onEdgeMouseEnter={onEdgeMouseEnter}
          onEdgeMouseMove={onEdgeMouseMove}
          onEdgeMouseLeave={onEdgeMouseLeave}
          edgeUpdaterRadius={edgeUpdaterRadius}
        />
        {children}
      </div>
    );
  }
);

ReactFlowy.displayName = 'ReactFlowy';

export default React.memo(ReactFlowy);
