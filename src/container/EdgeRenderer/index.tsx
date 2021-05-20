import React, { memo } from 'react';
import { useSnapshot } from 'valtio';

import MarkerDefinitions from './MarkerDefinitions';
import { getSourceTargetNodes } from './utils';
import {
  Edge,
  Node,
  Transform,
} from '../../types';
import { state } from '../../store/state';

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
  const snap = useSnapshot(state);

  if (!snap.width) {
    return null;
  }

  const { arrowHeadColor } = props;
  const transformStyle = `translate(${snap.transform[0]},${snap.transform[1]}) scale(${snap.transform[2]})`;

  return (
    <svg width={snap.width} height={snap.height} className="react-flowy__edges">
      <MarkerDefinitions color={arrowHeadColor} />
      <g transform={transformStyle}>
        {(snap.edges as Edge[]).map(edge => (
          <Edgey
            key={edge.id}
            edge={edge}
            props={props}
            nodes={snap.nodes as Node[]}
            transform={snap.transform}
            width={snap.width}
            height={snap.height}
          />
        ))}
      </g>
    </svg>
  );
};

EdgeRenderer.displayName = 'EdgeRenderer';

export default memo(EdgeRenderer);
