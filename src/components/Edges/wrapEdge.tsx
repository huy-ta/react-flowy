import React, { memo, ComponentType, useCallback, useMemo } from 'react';
import cc from 'classcat';

import { Edge, EdgeProps, WrapEdgeProps } from '../../types';

export default (EdgeComponent: ComponentType<EdgeProps>) => {
  const EdgeWrapper = ({
    id,
    className,
    type,
    data,
    onClick,
    onEdgeDoubleClick,
    animated,
    label,
    labelStyle,
    labelShowBg,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    style,
    arrowHeadType,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    markerEndId,
    isHidden,
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
          source={source}
          target={target}
          animated={animated}
          label={label}
          labelStyle={labelStyle}
          labelShowBg={labelShowBg}
          labelBgStyle={labelBgStyle}
          labelBgPadding={labelBgPadding}
          labelBgBorderRadius={labelBgBorderRadius}
          data={data}
          style={style}
          arrowHeadType={arrowHeadType}
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
          markerEndId={markerEndId}
        />
      </g>
    );
  };

  EdgeWrapper.displayName = 'EdgeWrapper';

  return memo(EdgeWrapper);
};
