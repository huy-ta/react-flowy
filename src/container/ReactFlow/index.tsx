import React, { useMemo, HTMLAttributes, MouseEvent, WheelEvent, forwardRef } from 'react';
import cc from 'classcat';

import GraphView from '../GraphView';
import ElementUpdater from '../../components/ElementUpdater';
import { createNodeTypes } from '../NodeRenderer/utils';
import { BezierEdge, StepEdge, SmoothStepEdge, StraightEdge } from '../../components/Edges';
import { createEdgeTypes } from '../EdgeRenderer/utils';
import Wrapper from './Wrapper';
import {
  Elements,
  NodeTypesType,
  EdgeTypesType,
  OnLoadFunc,
  Node,
  Edge,
  FlowTransform,
  TranslateExtent,
  KeyCode,
  PanOnScrollMode,
  NodeExtent,
} from '../../types';

import '../../style.css';
import '../../theme-default.css';
import { DraggableData } from 'react-draggable';

const defaultEdgeTypes = {
  default: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
};

export interface ReactFlowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onLoad'> {
  elements: Elements;
  onElementClick?: (event: MouseEvent, element: Node | Edge) => void;
  onElementsRemove?: (elements: Elements) => void;
  onNodeDoubleClick?: (event: MouseEvent, node: Node) => void;
  onNodeMouseEnter?: (event: MouseEvent, node: Node) => void;
  onNodeMouseMove?: (event: MouseEvent, node: Node) => void;
  onNodeMouseLeave?: (event: MouseEvent, node: Node) => void;
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: MouseEvent, node: Node) => void;
  onNodeDrag?: (event: MouseEvent, node: Node, draggableData: DraggableData) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node) => void;
  onLoad?: OnLoadFunc;
  onMove?: (flowTransform?: FlowTransform) => void;
  onMoveStart?: (flowTransform?: FlowTransform) => void;
  onMoveEnd?: (flowTransform?: FlowTransform) => void;
  onPaneScroll?: (event?: WheelEvent) => void;
  onPaneClick?: (event: MouseEvent) => void;
  onPaneContextMenu?: (event: MouseEvent) => void;
  nodeTypes: NodeTypesType;
  edgeTypes?: EdgeTypesType;
  zoomActivationKeyCode?: KeyCode;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
  onlyRenderVisibleElements?: boolean;
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  paneMoveable?: boolean;
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
  defaultPosition?: [number, number];
  translateExtent?: TranslateExtent;
  nodeExtent?: NodeExtent;
  arrowHeadColor?: string;
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

const ReactFlow = forwardRef<ReactFlowRefType, ReactFlowProps>(
  (
    {
      elements = [],
      className,
      nodeTypes,
      edgeTypes = defaultEdgeTypes,
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
      onlyRenderVisibleElements = false,
      nodesDraggable,
      nodesConnectable,
      minZoom,
      maxZoom,
      defaultZoom = 1,
      defaultPosition = [0, 0],
      translateExtent,
      nodeExtent,
      arrowHeadColor = '#b1b1b7',
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
      nodeTypesId = '1',
      edgeTypesId = '1',
      ...rest
    },
    ref
  ) => {
    const nodeTypesParsed = useMemo(() => createNodeTypes(nodeTypes), [nodeTypesId]);
    const edgeTypesParsed = useMemo(() => createEdgeTypes(edgeTypes), [edgeTypesId]);
    const reactFlowClasses = cc(['react-flowy', className]);

    return (
      <div {...rest} ref={ref} className={reactFlowClasses}>
        <Wrapper>
          <GraphView
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
            onlyRenderVisibleElements={onlyRenderVisibleElements}
            nodesDraggable={nodesDraggable}
            nodesConnectable={nodesConnectable}
            minZoom={minZoom}
            maxZoom={maxZoom}
            defaultZoom={defaultZoom}
            defaultPosition={defaultPosition}
            translateExtent={translateExtent}
            nodeExtent={nodeExtent}
            arrowHeadColor={arrowHeadColor}
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
          <ElementUpdater elements={elements} />
          {children}
        </Wrapper>
      </div>
    );
  }
);

ReactFlow.displayName = 'ReactFlow';

export default ReactFlow;
