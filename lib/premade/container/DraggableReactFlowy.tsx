import React, { forwardRef, useEffect, useRef } from 'react';

import {
  Node,
  Edge,
} from '../../types';

import ReactFlowy, { ReactFlowyProps } from '../../container/ReactFlowy';
import { useStore } from '../../store/state';
import { edgesSelector, nodesSelector } from '../../store/selectors';
import { getNodeById, getRectangleByNodeId } from '../../utils/node';
import { repairConnection } from '../../features/layout/manhattanLayout';

export type ReactFlowRefType = HTMLDivElement;

const DraggableReactFlowy = forwardRef<ReactFlowRefType, ReactFlowyProps>(
  (
    {
      onNodeDrag,
      onNodeDragStop,
      ...rest
    },
    ref
  ) => {
    const nodes = useRef<Node[]>([]);
    const edges = useRef<Edge[]>([]);
    const upsertEdge = useStore(state => state.upsertEdge);

    useEffect(() => {
      useStore.subscribe(edgesFromStore => {
        edges.current = edgesFromStore;
      }, edgesSelector);
  
      useStore.subscribe(nodesFromStore => {
        nodes.current = nodesFromStore;
      }, nodesSelector);
    }, []);

    const handleNodeDrag: ReactFlowyProps['onNodeDrag'] = (event, node, dragDelta) => {
      const elements = [...nodes.current, ...edges.current];
  
      edges.current.forEach(edge => {
        if (edge.target !== node.id && edge.source !== node.id) return edge;
  
        const otherNode = edge.target === node.id ?
          getNodeById(elements)(edge.source) :
          getNodeById(elements)(edge.target);
  
        const nodeRectangle = getRectangleByNodeId(elements)(node.id);
        nodeRectangle.x += dragDelta.deltaX;
        nodeRectangle.y += dragDelta.deltaY;
  
        const otherNodeRectangle = getRectangleByNodeId(elements)(otherNode!.id);
  
        const newStart = {
          x: edge.waypoints[0].x + dragDelta.deltaX,
          y: edge.waypoints[0].y + dragDelta.deltaY,
        }
  
        const newEnd = {
          x: edge.waypoints[edge.waypoints.length - 1].x + dragDelta.deltaX,
          y: edge.waypoints[edge.waypoints.length - 1].y + dragDelta.deltaY,
        }
  
        upsertEdge({ ...edge, isDragging: true, waypoints: edge.source === node.id ?
          repairConnection(nodeRectangle, otherNodeRectangle, node.shapeType, otherNode!.shapeType, newStart, undefined, edge.waypoints, { connectionStart: true }) :
          repairConnection(otherNodeRectangle, nodeRectangle, otherNode!.shapeType, node.shapeType, undefined, newEnd, edge.waypoints, { connectionEnd: true })
        });
      });

      if (typeof onNodeDrag === 'function') onNodeDrag(event, node, dragDelta);
    };
  
    const handleNodeDragStop: ReactFlowyProps['onNodeDragStop'] = (event, node) => {
      edges.current.forEach(edge => {
        if (edge.target !== node.id && edge.source !== node.id) return edge;
  
        if (edge.isDragging) upsertEdge({ ...edge, isDragging: false });
      });

      if (typeof onNodeDragStop === 'function') onNodeDragStop(event, node);
    };

    return (
      <ReactFlowy
        ref={ref}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        {...rest}
      />
    );
  }
);

export default React.memo(DraggableReactFlowy);
