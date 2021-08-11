import React, { memo, ComponentType, useCallback, useMemo } from 'react';
import cc from 'classcat';

import { Edge, EdgeProps } from '../../types';

export interface WrapEdgeProps<T = any> {
  edge: Edge<T>;
  onClick?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  markerEndId?: string;
  handleEdgeUpdate: boolean;
  onContextMenu?: (event: React.MouseEvent, edge: Edge) => void;
  onMouseEnter?: (event: React.MouseEvent, edge: Edge) => void;
  onMouseMove?: (event: React.MouseEvent, edge: Edge) => void;
  onMouseLeave?: (event: React.MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
  onEdgeUpdateStart?: (event: React.MouseEvent, edge: Edge) => void;
  storeId: string;
}

export default (EdgeComponent: ComponentType<EdgeProps>) => {
  const EdgeWrapper = ({
    edge,
    onClick,
    onEdgeDoubleClick,
    markerEndId,
    onContextMenu,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    storeId,
  }: WrapEdgeProps): JSX.Element | null => {
    const edgeClasses = cc([
      'react-flowy__edge',
      `react-flowy__edge-${edge.type}`,
      edge.className,
    ]);

    const edgeElement = useMemo<Edge>(() => {
      const el: Edge = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        waypoints: edge.waypoints,
        type: edge.type,
      };

      if (typeof edge.data !== 'undefined') {
        el.data = edge.data;
      }

      return el;
    }, [edge]);

    const onEdgeClick = useCallback(
      (event: React.MouseEvent<SVGGElement, MouseEvent>): void => {
        onClick?.(event, edgeElement);
      },
      [edgeElement, onClick]
    );

    const onEdgeDoubleClickHandler = useCallback(
      (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
        onEdgeDoubleClick?.(event, edgeElement);
      },
      [edgeElement, onEdgeDoubleClick]
    );

    const onEdgeContextMenu = useCallback(
      (event: React.MouseEvent<SVGGElement, MouseEvent>): void => {
        onContextMenu?.(event, edgeElement);
      },
      [edgeElement, onContextMenu]
    );

    const onEdgeMouseEnter = useCallback(
      (event: React.MouseEvent<SVGGElement, MouseEvent>): void => {
        onMouseEnter?.(event, edgeElement);
      },
      [edgeElement, onContextMenu]
    );

    const onEdgeMouseMove = useCallback(
      (event: React.MouseEvent<SVGGElement, MouseEvent>): void => {
        onMouseMove?.(event, edgeElement);
      },
      [edgeElement, onContextMenu]
    );

    const onEdgeMouseLeave = useCallback(
      (event: React.MouseEvent<SVGGElement, MouseEvent>): void => {
        onMouseLeave?.(event, edgeElement);
      },
      [edgeElement, onContextMenu]
    );

    if (edge.isHidden) {
      return null;
    }

    return (
      <g
        className={edgeClasses}
        onClick={onEdgeClick}
        onDoubleClick={onEdgeDoubleClickHandler}
        onContextMenu={onEdgeContextMenu}
        onMouseEnter={onEdgeMouseEnter}
        onMouseMove={onEdgeMouseMove}
        onMouseLeave={onEdgeMouseLeave}
      >
        <EdgeComponent
          edge={edge}
          markerEndId={markerEndId}
          storeId={storeId}
        />
      </g>
    );
  };

  EdgeWrapper.displayName = 'EdgeWrapper';

  return memo(EdgeWrapper);
};
