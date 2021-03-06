import React from 'react';

import MarkerDefinitions from './MarkerDefinitions';
import { getSourceTargetNodes } from './utils';
import {
  Edge,
  Node,
  Transform,
} from '../../types';
import { useStoreById } from '../../store/state';
import { heightSelector, nodesSelector, transformSelector, widthSelector, edgesSelector } from '../../store/selectors';

interface EdgeRendererProps {
  edgeTypes: any;
  onElementClick?: (event: React.MouseEvent, element: Node | Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  markerEndId?: string;
  onEdgeContextMenu?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: React.MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
  storeId: string;
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
  const EdgeComponent = props.edgeTypes[edgeType];

  return (
    <EdgeComponent
      key={edge.id}
      edge={edge}
      onClick={props.onElementClick}
      markerEndId={props.markerEndId}
      onContextMenu={props.onEdgeContextMenu}
      onMouseEnter={props.onEdgeMouseEnter}
      onMouseMove={props.onEdgeMouseMove}
      onMouseLeave={props.onEdgeMouseLeave}
      edgeUpdaterRadius={props.edgeUpdaterRadius}
      onEdgeDoubleClick={props.onEdgeDoubleClick}
      storeId={props.storeId}
    />
  );
});

const EdgeRenderer = (props: EdgeRendererProps) => {
  const useStore = useStoreById(props.storeId)!;
  const width = useStore(widthSelector);
  const height = useStore(heightSelector);
  const transform = useStore(transformSelector);
  const nodes = useStore(nodesSelector);
  const edges = useStore(edgesSelector);

  if (!width) {
    return null;
  }

  const transformStyle = `translate(${transform[0]},${transform[1]}) scale(${transform[2]})`;

  return (
    <svg width={width} height={height} className="react-flowy__edges">
      <MarkerDefinitions />
      <g className="react-flowy__edges__transformer" transform={transformStyle}>
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

export default React.memo(EdgeRenderer);
