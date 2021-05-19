import React, { memo, CSSProperties, useCallback } from 'react';

import { useStoreState } from '../../store/hooks';
import ConnectionLine from '../../components/ConnectionLine/index';
import { isEdge } from '../../utils/graph';
import MarkerDefinitions from './MarkerDefinitions';
import { getSourceTargetNodes } from './utils';
import {
  Edge,
  Node,
  Elements,
  Connection,
  ConnectionLineType,
  ConnectionLineComponent,
  ConnectionMode,
  Transform,
  OnEdgeUpdateFunc,
} from '../../types';

interface EdgeRendererProps {
  edgeTypes: any;
  connectionLineType: ConnectionLineType;
  connectionLineStyle?: CSSProperties;
  connectionLineComponent?: ConnectionLineComponent;
  connectionMode?: ConnectionMode;
  onElementClick?: (event: React.MouseEvent, element: Node | Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  arrowHeadColor: string;
  markerEndId?: string;
  onlyRenderVisibleElements: boolean;
  onEdgeUpdate?: OnEdgeUpdateFunc;
  onEdgeContextMenu?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeUpdateStart?: (event: React.MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
}

interface EdgeWrapperProps {
  edge: Edge;
  props: EdgeRendererProps;
  nodes: Node[];
  selectedElements: Elements | null;
  elementsSelectable: boolean;
  transform: Transform;
  width: number;
  height: number;
  onlyRenderVisibleElements: boolean;
  connectionMode?: ConnectionMode;
}

const Edgey = ({
  edge,
  props,
  nodes,
  selectedElements,
  elementsSelectable,
}: EdgeWrapperProps) => {
  const { sourceNode } = getSourceTargetNodes(edge, nodes);

  const onConnectEdge = useCallback(
    (connection: Connection) => {
      props.onEdgeUpdate?.(edge, connection);
    },
    [edge]
  );

  if (!sourceNode) {
    console.warn(`couldn't create edge for source id: ${edge.source}; edge id: ${edge.id}`);

    return null;
  }

  // The source node needs to be initialized first
  if (!sourceNode.__rf.width) {
    return null;
  }

  const edgeType = edge.type || 'default';
  const EdgeComponent = props.edgeTypes[edgeType] || props.edgeTypes.default;

  const isSelected = selectedElements?.some((elm) => isEdge(elm) && elm.id === edge.id) || false;

  return (
    <EdgeComponent
      key={edge.id}
      id={edge.id}
      className={edge.className}
      type={edge.type}
      data={edge.data}
      onClick={props.onElementClick}
      selected={isSelected}
      animated={edge.animated}
      label={edge.label}
      labelStyle={edge.labelStyle}
      labelShowBg={edge.labelShowBg}
      labelBgStyle={edge.labelBgStyle}
      labelBgPadding={edge.labelBgPadding}
      labelBgBorderRadius={edge.labelBgBorderRadius}
      style={edge.style}
      arrowHeadType={edge.arrowHeadType}
      source={edge.source}
      target={edge.target}
      elementsSelectable={elementsSelectable}
      markerEndId={props.markerEndId}
      isHidden={edge.isHidden}
      onConnectEdge={onConnectEdge}
      handleEdgeUpdate={typeof props.onEdgeUpdate !== 'undefined'}
      onContextMenu={props.onEdgeContextMenu}
      onMouseEnter={props.onEdgeMouseEnter}
      onMouseMove={props.onEdgeMouseMove}
      onMouseLeave={props.onEdgeMouseLeave}
      edgeUpdaterRadius={props.edgeUpdaterRadius}
      onEdgeDoubleClick={props.onEdgeDoubleClick}
      onEdgeUpdateStart={props.onEdgeUpdateStart}
    />
  );
};

const EdgeRenderer = (props: EdgeRendererProps) => {
  const transform = useStoreState((state) => state.transform);
  const nodes = useStoreState((state) => state.nodes);
  const edges = useStoreState((state) => state.edges);
  const connectionNodeId = useStoreState((state) => state.connectionNodeId);
  const connectionHandleId = useStoreState((state) => state.connectionHandleId);
  const connectionHandleType = useStoreState((state) => state.connectionHandleType);
  const connectionPosition = useStoreState((state) => state.connectionPosition);
  const selectedElements = useStoreState((state) => state.selectedElements);
  const nodesConnectable = useStoreState((state) => state.nodesConnectable);
  const elementsSelectable = useStoreState((state) => state.elementsSelectable);
  const width = useStoreState((state) => state.width);
  const height = useStoreState((state) => state.height);

  if (!width) {
    return null;
  }

  const {
    connectionLineType,
    arrowHeadColor,
    connectionLineStyle,
    connectionLineComponent,
    onlyRenderVisibleElements,
  } = props;
  const transformStyle = `translate(${transform[0]},${transform[1]}) scale(${transform[2]})`;
  const renderConnectionLine = connectionNodeId && connectionHandleType;

  return (
    <svg width={width} height={height} className="react-flow__edges">
      <MarkerDefinitions color={arrowHeadColor} />
      <g transform={transformStyle}>
        {edges.map((edge: Edge) => (
          <Edgey
            key={edge.id}
            edge={edge}
            props={props}
            nodes={nodes}
            selectedElements={selectedElements}
            elementsSelectable={elementsSelectable}
            transform={transform}
            width={width}
            height={height}
            onlyRenderVisibleElements={onlyRenderVisibleElements}
          />
        ))}
        {renderConnectionLine && (
          <ConnectionLine
            nodes={nodes}
            connectionNodeId={connectionNodeId!}
            connectionHandleId={connectionHandleId}
            connectionHandleType={connectionHandleType!}
            connectionPositionX={connectionPosition.x}
            connectionPositionY={connectionPosition.y}
            transform={transform}
            connectionLineStyle={connectionLineStyle}
            connectionLineType={connectionLineType}
            isConnectable={nodesConnectable}
            CustomConnectionLineComponent={connectionLineComponent}
          />
        )}
      </g>
    </svg>
  );
};

EdgeRenderer.displayName = 'EdgeRenderer';

export default memo(EdgeRenderer);
