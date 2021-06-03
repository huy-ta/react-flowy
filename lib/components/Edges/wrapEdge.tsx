import React, { memo, ComponentType, useCallback, useMemo, CSSProperties } from 'react';
import cc from 'classcat';

import { ArrowHeadType, Edge, EdgeProps, ElementId, Point } from '../../types';

export interface WrapEdgeProps<T = any> {
  id: ElementId;
  className?: string;
  type: string;
  data?: T;
  onClick?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  style?: CSSProperties;
  arrowHeadType?: ArrowHeadType;
  label?: string;
  source: ElementId;
  target: ElementId;
  waypoints: Point[];
  isForming?: boolean;
  markerEndId?: string;
  isHidden?: boolean;
  isSelected?: boolean;
  isInvalid?: boolean;
  isDragging?: boolean;
  handleEdgeUpdate: boolean;
  onContextMenu?: (event: React.MouseEvent, edge: Edge) => void;
  onMouseEnter?: (event: React.MouseEvent, edge: Edge) => void;
  onMouseMove?: (event: React.MouseEvent, edge: Edge) => void;
  onMouseLeave?: (event: React.MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
  onEdgeUpdateStart?: (event: React.MouseEvent, edge: Edge) => void;
}

export default (EdgeComponent: ComponentType<EdgeProps>) => {
  const EdgeWrapper = ({
    id,
    className,
    type,
    data,
    onClick,
    onEdgeDoubleClick,
    style,
    arrowHeadType,
    label,
    source,
    target,
    waypoints,
    isForming,
    markerEndId,
    isHidden,
    isSelected,
    isInvalid,
    isDragging,
    onContextMenu,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  }: WrapEdgeProps): JSX.Element | null => {
    const edgeClasses = cc([
      'react-flowy__edge',
      `react-flowy__edge-${type}`,
      className,
    ]);

    const edgeElement = useMemo<Edge>(() => {
      const el: Edge = {
        id,
        source,
        target,
        waypoints,
        type,
      };

      if (typeof data !== 'undefined') {
        el.data = data;
      }

      return el;
    }, [id, source, target, type, data]);

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

    if (isHidden) {
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
          id={id}
          label={label}
          source={source}
          target={target}
          waypoints={waypoints}
          isForming={isForming}
          isSelected={isSelected}
          isInvalid={isInvalid}
          isDragging={isDragging}
          data={data}
          style={style}
          arrowHeadType={arrowHeadType}
          markerEndId={markerEndId}
        />
      </g>
    );
  };

  EdgeWrapper.displayName = 'EdgeWrapper';

  return memo(EdgeWrapper);
};
