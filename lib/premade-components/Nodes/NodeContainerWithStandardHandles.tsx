import React, { useState, useRef, useEffect } from 'react';
import StandardHandles, { ARROW_DISTANCE } from '../Handles/StandardHandles';
import { Node } from '../../types';
import { isPointInRect } from '../../utils/geometry';

export interface NodeContainerWithStandardHandlesProps {
  node: Node;
  TopHandleIndicator?: React.FC;
  RightHandleIndicator?: React.FC;
  BottomHandleIndicator?: React.FC;
  LeftHandleIndicator?: React.FC;
}

const NodeContainerWithStandardHandles: React.FC<NodeContainerWithStandardHandlesProps> = React.memo(({
  children,
  node,
  TopHandleIndicator = React.Fragment,
  RightHandleIndicator = React.Fragment,
  BottomHandleIndicator = React.Fragment,
  LeftHandleIndicator = React.Fragment,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMouseDowned, setIsMouseDowned] = useState(false);
  const [shouldShowHandles, setShouldShowHandles] = useState(false);

  const handleMouseEnter = () => {
    setShouldShowHandles(true);
  }

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
      x: containerBoundingRect.x - (ARROW_DISTANCE + TOLERANCE),
      y: containerBoundingRect.y - (ARROW_DISTANCE + TOLERANCE),
      width: containerBoundingRect.width + 2 * (ARROW_DISTANCE + TOLERANCE),
      height: containerBoundingRect.height + 2 * (ARROW_DISTANCE + TOLERANCE)
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
  }

  return (
    <div ref={containerRef} className="react-flowy__node-container-with-standard-handles" onMouseEnter={handleMouseEnter} onMouseDown={handleMouseDown}>
      <StandardHandles
        node={node}
        shouldShowHandles={shouldShowHandles}
        TopHandleIndicator={TopHandleIndicator}
        RightHandleIndicator={RightHandleIndicator}
        BottomHandleIndicator={BottomHandleIndicator}
        LeftHandleIndicator={LeftHandleIndicator}
      />
      {children}
    </div>
  );
});

export default NodeContainerWithStandardHandles;
