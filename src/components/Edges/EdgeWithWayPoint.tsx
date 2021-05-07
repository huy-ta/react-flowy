import React, { memo } from 'react';

import { getMarkerEnd } from './utils';
import { EdgeProps, EdgeWaypoint } from '../../types';

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

export default memo(
  ({
    waypoints,
    style,
    arrowHeadType,
    markerEndId,
  }: EdgeProps) => {
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
    const segments = getEdgeSegmentsFromWaypoints(waypoints);

    return (
      <>
        {segments.map((segment, index) => (
          <path
            style={style}
            className="react-flow__edge-path"
            d={`M ${segment.sourceX},${segment.sourceY}L ${segment.targetX},${segment.targetY}`}
            markerEnd={index === segments.length - 1 ? markerEnd : undefined}
          />
        ))}
      </>
    );
  }
);
