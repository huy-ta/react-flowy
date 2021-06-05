import React, { useState, useRef, useEffect } from 'react';
import cc from 'classcat';

import StandardHandles, { ARROW_DISTANCE, StandardHandlesProps } from '../Handles/StandardHandles';
import { Edge, Node } from '../../../types';
import { isPointInRect } from '../../../utils/geometry';
import { useStore } from '../../../store/state';

export interface NodeContainerWithStandardHandlesProps {
  node: Node;
  additionalEdgeProps?: Partial<Edge>
  isHandleDisabled?: boolean;
  arrowDistance?: number;
  Handles?: React.FC<StandardHandlesProps>;
  TopHandleIndicator?: React.FC;
  RightHandleIndicator?: React.FC;
  BottomHandleIndicator?: React.FC;
  LeftHandleIndicator?: React.FC;
}

const NodeContainer: React.FC<NodeContainerWithStandardHandlesProps> = React.memo(({
  children,
  node,
  additionalEdgeProps = { type: 'standardEdge' },
  isHandleDisabled,
  arrowDistance = ARROW_DISTANCE,
  Handles = StandardHandles,
  TopHandleIndicator = React.Fragment,
  RightHandleIndicator = React.Fragment,
  BottomHandleIndicator = React.Fragment,
  LeftHandleIndicator = React.Fragment,
}) => {
  const setSelectedElementById = useStore(state => state.setSelectedElementById);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMouseDowned, setIsMouseDowned] = useState(false);
  const [shouldShowHandles, setShouldShowHandles] = useState(false);
  const touchTimeout = useRef<number>();
  const initialTouch = useRef<React.Touch>();

  const handleMouseEnter = () => {
    setShouldShowHandles(true);
  };

  useEffect(() => {
    if (!shouldShowHandles) return;

    document.addEventListener('mousemove', handleMouseMove);

    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [shouldShowHandles, isMouseDowned])

  useEffect(() => {
    if (!isMouseDowned) return;

    document.addEventListener('mouseup', handleMouseUp);

    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isMouseDowned])

  const handleMouseMove = (e: MouseEvent) => {
    if (isMouseDowned) {
      if (shouldShowHandles) setShouldShowHandles(false);

      return;
    }

    const TOLERANCE = 12;
    const containerBoundingRect = containerRef.current!.getBoundingClientRect();
    const virtualBoundingRect = {
      x: containerBoundingRect.x - (arrowDistance + TOLERANCE),
      y: containerBoundingRect.y - (arrowDistance + TOLERANCE),
      width: containerBoundingRect.width + 2 * (arrowDistance + TOLERANCE),
      height: containerBoundingRect.height + 2 * (arrowDistance + TOLERANCE)
    };

    if (!isPointInRect({ x: e.clientX, y: e.clientY }, virtualBoundingRect)) {
      setShouldShowHandles(false);
    }
  }

  const handleMouseDown = () => {
    setIsMouseDowned(true);
  };

  const handleMouseUp = (e: MouseEvent) => {
    const containerBoundingRect = containerRef.current!.getBoundingClientRect();

    if (isPointInRect({ x: e.clientX, y: e.clientY }, containerBoundingRect)) {
      setShouldShowHandles(true);
    }

    setIsMouseDowned(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    setSelectedElementById(node.id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    initialTouch.current = e.touches[0];

    touchTimeout.current = window.setTimeout(() => {
      setShouldShowHandles(true);
    }, 250);
  };

  const handleTouchEnd = () => {
    if (touchTimeout.current) clearTimeout(touchTimeout.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0].clientX - initialTouch.current!.clientX < 20 && e.touches[0].clientY - initialTouch.current!.clientY < 20) {
      return;
    }

    if (touchTimeout.current) clearTimeout(touchTimeout.current);
  };

  return (
    <div
      ref={containerRef}
      className={cc([
        'react-flowy__node-container-with-standard-handles',
        {
          'react-flowy__node-container-with-standard-handles--selected': node.isSelected
        }
      ])} 
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      {!isHandleDisabled && <Handles
        node={node}
        additionalEdgeProps={additionalEdgeProps}
        shouldShowHandles={shouldShowHandles}
        TopHandleIndicator={TopHandleIndicator}
        RightHandleIndicator={RightHandleIndicator}
        BottomHandleIndicator={BottomHandleIndicator}
        LeftHandleIndicator={LeftHandleIndicator}
      />}
      {children}
    </div>
  );
});

export default NodeContainer;
