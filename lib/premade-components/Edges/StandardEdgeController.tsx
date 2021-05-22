import React, { useState, useEffect } from 'react';

import { Connection, ApproxIntersection, Axis, EdgeProps } from '../../types';
import { state as reactFlowyState } from '../../store/state';
import { getCanvas } from '../../utils/graph';
import { isPrimaryButton } from '../../utils/mouse';
import { getRectangleByNodeId } from '../../utils/node';
import { getApproxIntersection } from '../../utils/intersection';
import { eventPointToCanvasCoordinates } from '../../utils/coordinates';
import { Context, activateBendpointMove, handleMouseMoveEndWithContext, handleMouseMoveWithContext } from '../../features/bendpoints/connectionSegmentMove';
import { setEdges, setSelectedElementById } from '../../store/actions';

export interface EdgeWaypoint {
  x: number;
  y: number;
}

const getEdgeSegmentsFromWaypoints = (waypoints: EdgeWaypoint[]) => {
  const pair = [];

  for (let index = 0; index < waypoints.length - 1; index++) {
    pair.push({
      sourceX: waypoints[index].x,
      sourceY: waypoints[index].y,
      targetX: waypoints[index + 1].x,
      targetY: waypoints[index + 1].y
    });
  }

  return pair;
}

let eventDelta = { x: 0, y: 0 };

export default React.memo(
  ({
    id,
    source,
    target,
    waypoints,
  }: EdgeProps) => {
    const segments = getEdgeSegmentsFromWaypoints(waypoints as EdgeWaypoint[]);
    const [context, setContext] = useState<Context>();
    const [isBendpointMoveActive, setIsBendpointMoveActive] = useState(false);

    useEffect(() => {
      if (!isBendpointMoveActive) return;

      document.addEventListener('mouseup', handleMouseUp);

      return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [context, isBendpointMoveActive]);

    useEffect(() => {
      if (!isBendpointMoveActive) return;

      document.addEventListener('mousemove', handleMouseMove);

      return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [context, isBendpointMoveActive]);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!isPrimaryButton(e.nativeEvent)) return;

      const canvas = getCanvas(reactFlowyState.transform);
      const connection: Connection = {
        waypoints,
        source: getRectangleByNodeId(reactFlowyState.nodes)(source),
        target: getRectangleByNodeId(reactFlowyState.nodes)(target),
      };
      const intersection = getApproxIntersection(waypoints, eventPointToCanvasCoordinates(e.nativeEvent)(canvas)) as ApproxIntersection;
      const newContext = activateBendpointMove(connection, intersection);

      eventDelta = { x: 0, y: 0 };

      setContext(newContext);
      setIsBendpointMoveActive(true);
    }

    const updateEdgesAndContext = (newConnection: Connection, newContext: Context) => {
      const newEdges = reactFlowyState.edges.map(edge => {
        if (edge.id !== id) return edge;

        edge.waypoints = newConnection.waypoints;

        return edge;
      });

      setEdges(newEdges);

      setContext(newContext);
    }

    const handleMouseUp = () => {
      if (!isBendpointMoveActive) return;

      setIsBendpointMoveActive(false);

      const { newConnection, newContext } = handleMouseMoveEndWithContext(context!);

      updateEdgesAndContext(newConnection, newContext);
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!context || !isBendpointMoveActive) return;

      if (context.axis === Axis.X) {
        eventDelta.x += Math.round(event.movementX / reactFlowyState.transform[2]);
      } else if (context.axis === Axis.Y) {
        eventDelta.y += Math.round(event.movementY / reactFlowyState.transform[2]);
      }

      const modifiedEvent = { ...event };

      modifiedEvent.movementX = eventDelta.x;
      modifiedEvent.movementY = eventDelta.y;

      const { newConnection, newContext } = handleMouseMoveWithContext(modifiedEvent)(context as Context);

      updateEdgesAndContext(newConnection, newContext);
    }

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();

      setSelectedElementById(id);
    }

    return (
      <>
        {segments.map(segment => (
          <polyline
            key={JSON.stringify(segment)}
            style={{ fill: 'none', strokeOpacity: 0, stroke: 'white', strokeWidth: 15, cursor: segment.sourceX === segment.targetX ? 'ew-resize' : 'ns-resize' }}
            points={`${segment.sourceX} ${segment.sourceY}, ${segment.targetX} ${segment.targetY}`}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
          />
        ))}
      </>
    );
  }
);
