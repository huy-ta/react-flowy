import React from 'react';
import cc from 'classcat';

import { getMarkerEnd } from '../../utils/edge';
import { EdgeProps } from '../../types';
import { getConnectionPath } from '../../utils/path';
import StandardEdgeMovements from './StandardEdgeMovements';

export default React.memo(
  ({
    id,
    style,
    arrowHeadType,
    source,
    target,
    waypoints,
    isForming,
    markerEndId,
  }: EdgeProps) => {
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    return (
      <>
        <path
          style={style}
          className={cc(['react-flowy__edge-path', { 'react-flowy__edge-path--is-forming': isForming }])}
          d={getConnectionPath({ waypoints }) as string}
          markerEnd={markerEnd}
        />
        {!isForming && <StandardEdgeMovements id={id} source={source} target={target} waypoints={waypoints} />}
      </>
    );
  }
);
