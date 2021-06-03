import React, { memo } from 'react';

import MarkerDefinitions from './MarkerDefinitions';
import { getSourceTargetNodes } from './utils';
import {
  Edge,
  Node,
  Transform,
} from '../../types';
import { useStore } from '../../store/state';
import { heightSelector, nodesSelector, transformSelector, widthSelector, edgesSelector } from '../../store/selectors';

interface EdgeRendererProps {
  edgeTypes: any;
  onElementClick?: (event: React.MouseEvent, element: Node | Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  arrowHeadColor: string;
  markerEndId?: string;
  onEdgeContextMenu?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: React.MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
}

interface EdgeWrapperProps {
  edge: Edge;
  props: EdgeRendererProps;
  nodes: Node[];
  transform: Transform;
  width: number;
  height: number;
}

const EdgeWrapper = React.memo(({
  edge,
  props,
  nodes,
}: EdgeWrapperProps) => {
  const { sourceNode } = getSourceTargetNodes(edge, nodes);

  if (!sourceNode) {
    console.warn(`couldn't create edge for source id: ${edge.source}; edge id: ${edge.id}`);

    return null;
  }

  // The source node needs to be initialized first
  if (!sourceNode.width) {
    return null;
  }

  const edgeType = edge.type || 'standardEdge';
  const EdgeComponent = props.edgeTypes[edgeType] || props.edgeTypes.default;

  return (
    <EdgeComponent
      key={edge.id}
      id={edge.id}
      className={edge.className}
      type={edge.type}
      data={edge.data}
      onClick={props.onElementClick}
      style={edge.style}
      arrowHeadType={edge.arrowHeadType}
      label={edge.label}
      source={edge.source}
      target={edge.target}
      waypoints={edge.waypoints}
      isForming={edge.isForming}
      isSelected={edge.isSelected}
      isInvalid={edge.isInvalid}
      isDragging={edge.isDragging}
      markerEndId={props.markerEndId}
      isHidden={edge.isHidden}
      onContextMenu={props.onEdgeContextMenu}
      onMouseEnter={props.onEdgeMouseEnter}
      onMouseMove={props.onEdgeMouseMove}
      onMouseLeave={props.onEdgeMouseLeave}
      edgeUpdaterRadius={props.edgeUpdaterRadius}
      onEdgeDoubleClick={props.onEdgeDoubleClick}
    />
  );
});

const EdgeRenderer = (props: EdgeRendererProps) => {
  const width = useStore(widthSelector);
  const height = useStore(heightSelector);
  const transform = useStore(transformSelector);
  const nodes = useStore(nodesSelector);
  const edges = useStore(edgesSelector);

  if (!width) {
    return null;
  }

  const { arrowHeadColor } = props;
  const transformStyle = `translate(${transform[0]},${transform[1]}) scale(${transform[2]})`;

  return (
    <svg width={width} height={height} className="react-flowy__edges">
      <MarkerDefinitions color={arrowHeadColor} />
      <g transform={transformStyle}>
        {edges.map(edge => (
          <EdgeWrapper
            key={edge.id}
            edge={edge}
            props={props}
            nodes={nodes as Node[]}
            transform={transform}
            width={width}
            height={height}
          />
        ))}
      </g>
    </svg>
  );
};

EdgeRenderer.displayName = 'EdgeRenderer';

export default memo(EdgeRenderer);
