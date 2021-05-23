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
  const [isPressed, setIsPressed] = useState(false);
  const [isAddingEdge, setIsAddingEdge] = useState(false);

  useEffect(() => {
    if (!isPressed) return;

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag);

    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('touchmove', handleDrag);
    }
  }, [isPressed, isAddingEdge]);

  useEffect(() => {
    if (!isPressed) return;

    document.addEventListener('mouseup', handleDragStop);
    document.addEventListener('touchend', handleDragStop);

    return () => {
      document.removeEventListener('mouseup', handleDragStop);
      document.removeEventListener('touchend', handleDragStop);
    }
  }, [isPressed]);

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

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

  const handleDragStop = () => {
    document.body.style.overscrollBehavior = 'unset';

    let newEdges = reactFlowyState.edges.map(edge => {
      if (edge.target === '?' || edge.isInvalid) return;

      if (edge.source !== node.id) return edge;

      return { ...edge, id: `e${node.id}-${edge.target}`, isForming: false };
    }).filter(Boolean) as Edge[];

    const edgeIds = newEdges.map(edge => edge.id);
    newEdges = newEdges.filter(({ id }, index) => !edgeIds.includes(id, index + 1));

    setEdges(newEdges);

    setIsPressed(false);
    setIsAddingEdge(false);
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    document.body.style.overscrollBehavior = 'none';
  
    setIsPressed(true);
  }

  return (
    <div className={cc(['react-flowy__handle', { 'react-flowy__handle--hidden': !shouldShowHandle }])} onMouseDown={handleDragStart} onTouchStartCapture={handleDragStart}>
      {children}
    </div>
  )
});

export default Handle;
