import React, { useEffect, useState } from 'react';
import cc from 'classcat';
import { getNodeElementById } from '../../utils/node';
import { ArrowHeadType, Node, Edge, Point, Rectangle, LayoutType } from '../../types';
import { getCanvas } from '../../utils/graph';
import { reactFlowyState } from '../..';
import { eventPointToCanvasCoordinates } from '../../utils/coordinates';
import { isPointInRect } from '../../utils/geometry';
import { connectRectangles, connectRectangleToPoint } from '../../features/layout/manhattanLayout';
import { setEdges, upsertEdge } from '../../store/actions';

export interface HandleProps {
  node: Node;
  shouldShowHandle: boolean;
}

const Handle: React.FC<HandleProps> = React.memo(({ children, node, shouldShowHandle }) => {
  const [isMouseDowned, setIsMouseDowned] = useState(false);
  const [isAddingEdge, setIsAddingEdge] = useState(false);

  useEffect(() => {
    if (!isMouseDowned) return;

    document.addEventListener('mousemove', handleCursorMove);
    document.addEventListener('touchmove', handleCursorMove);

    return () => {
      document.removeEventListener('mousemove', handleCursorMove);
      document.removeEventListener('touchmove', handleCursorMove);
    }
  }, [isMouseDowned, isAddingEdge]);

  useEffect(() => {
    if (!isMouseDowned) return;

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    }
  }, [isMouseDowned]);

  const handleCursorMove = (e: MouseEvent | TouchEvent) => {
    const nodeElement = getNodeElementById(node.id)! as HTMLElement;

    const sourceRectangle: Rectangle = {
      x: node.position.x,
      y: node.position.y,
      width: nodeElement.offsetWidth,
      height: nodeElement.offsetHeight,
    };

    const canvas = getCanvas(reactFlowyState.transform);

    const cursorPosition = eventPointToCanvasCoordinates(e)(canvas);

    let targetNodeElement: HTMLElement;
    let targetRectangle: Rectangle;

    const targetNode = reactFlowyState.nodes.find(node => {
      targetNodeElement = getNodeElementById(node.id)! as HTMLElement;

      targetRectangle = {
        x: node.__rf.position.x,
        y: node.__rf.position.y,
        width: targetNodeElement.offsetWidth,
        height: targetNodeElement.offsetHeight,
      };

      return isPointInRect(cursorPosition, targetRectangle);
    });

    let waypoints: Point[];
    let newEdge: Partial<Edge> = {
      id: `e${node.id}-?`,
      source: node.id,
      target: '?',
      type: 'standardEdge',
      arrowHeadType: ArrowHeadType.ArrowClosed,
      isForming: true,
    };

    if (targetNode) {
      waypoints = connectRectangles(sourceRectangle, targetRectangle!, undefined, cursorPosition, { preferredLayouts: [LayoutType.VERTICAL_VERTICAL] });
      newEdge.target = targetNode.id;
      newEdge.waypoints = waypoints;

      const targetNodeValidator = reactFlowyState.nodeValidators[node.type || 'standardNode'];

      if (typeof targetNodeValidator === 'function') {
        const { isValid } = targetNodeValidator(node, targetNode, newEdge as Edge);

        if (!isValid) newEdge.isInvalid = true;
        else delete newEdge.isInvalid;
      }
    } else {
      waypoints = connectRectangleToPoint(sourceRectangle, cursorPosition);
      newEdge.target = '?';
      newEdge.waypoints = waypoints;
    }

    upsertEdge(newEdge as Edge);

    if (!isAddingEdge) {
      return setIsAddingEdge(true);
    }
  }

  const handleMouseUp = () => {
    let newEdges = reactFlowyState.edges.map(edge => {
      if (edge.target === '?' || edge.isInvalid) return;

      if (edge.source !== node.id) return edge;

      return { ...edge, id: `e${node.id}-${edge.target}`, isForming: false };
    }).filter(Boolean) as Edge[];

    const edgeIds = newEdges.map(edge => edge.id);
    newEdges = newEdges.filter(({ id }, index) => !edgeIds.includes(id, index + 1));

    setEdges(newEdges);

    setIsMouseDowned(false);
    setIsAddingEdge(false);
  }

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    setIsMouseDowned(true);
  }

  return (
    <div className={cc(['react-flowy__handle', { 'react-flowy__handle--hidden': !shouldShowHandle }])} onMouseDown={handleMouseDown} onTouchStartCapture={handleMouseDown}>
      {children}
    </div>
  )
});

export default Handle;
