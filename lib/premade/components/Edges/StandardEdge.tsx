import React from 'react';
import cc from 'classcat';

import { getMarkerEnd } from '../../../utils/edge';
import { ArrowHeadType, EdgeProps } from '../../../types';
import { getPathFromWaypoints } from '../../../utils/path';
import StandardEdgeController from './StandardEdgeController';

export default React.memo(
  ({
    edge,
    storeId
  }: EdgeProps) => {
    const {
      style,
      arrowHeadType,
      waypoints,
      isForming,
      isSelected,
      isInvalid,
    } = edge;
    const markerEnd = getMarkerEnd(arrowHeadType);
    const errorMarkerEnd = getMarkerEnd(`${arrowHeadType}--error` as ArrowHeadType);

    return (
      <>
        <path
          style={style}
          className={cc([
            'react-flowy__edge-path',
            {
              'react-flowy__edge-path--forming': isForming,
              'react-flowy__edge-path--selected': isSelected,
              'react-flowy__edge-path--invalid': isInvalid,
            }
          ])}
          d={getPathFromWaypoints(waypoints) as string}
          markerEnd={isInvalid ? errorMarkerEnd : markerEnd}
        />
        {!isForming && <StandardEdgeController edge={edge} storeId={storeId} />}
      </>
    );
  }
);
