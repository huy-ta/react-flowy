import React, { memo } from 'react';

import { useStoreState } from '../../store/hooks';
import MarkerDefinitions from './MarkerDefinitions';
import { getSourceTargetNodes } from './utils';
import {
  Edge,
  Node,
  Transform,
} from '../../types';

interface EdgeRendererProps {
  edgeTypes: any;
  onElementClick?: (event: React.MouseEvent, element: Node | Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  arrowHeadColor: string;
  markerEndId?: string;
  onlyRenderVisibleElements: boolean;
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

const Edgey = ({
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
  if (!sourceNode.__rf.width) {
    return null;
  }

  const edgeType = edge.type || 'default';
  const EdgeComponent = props.edgeTypes[edgeType] || props.edgeTypes.default;

  return (
    <EdgeComponent
      key={edge.id}
      id={edge.id}
      className={edge.className}
      type={edge.type}
      data={edge.data}
      onClick={props.onElementClick}
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
};

const EdgeRenderer = (props: EdgeRendererProps) => {
  const transform = useStoreState((state) => state.transform);
  const nodes = useStoreState((state) => state.nodes);
  const edges = useStoreState((state) => state.edges);
  const width = useStoreState((state) => state.width);
  const height = useStoreState((state) => state.height);

  if (!width) {
    return null;
  }

  const { arrowHeadColor } = props;
  const transformStyle = `translate(${transform[0]},${transform[1]}) scale(${transform[2]})`;

  return (
    <svg width={width} height={height} className="react-flowy__edges">
      <MarkerDefinitions color={arrowHeadColor} />
      <g transform={transformStyle}>
        {edges.map((edge: Edge) => (
          <Edgey
            key={edge.id}
            edge={edge}
            props={props}
            nodes={nodes}
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
