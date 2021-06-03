import React, { useEffect, useState } from 'react';
import cc from 'classcat';
import { getNodeElementById } from '../../utils/node';
import { ArrowHeadType, Node, Edge, Point, Rectangle, LayoutType } from '../../types';
import { getCanvas } from '../../utils/graph';
import { eventPointToCanvasCoordinates } from '../../utils/coordinates';
import { isPointInRect } from '../../utils/geometry';
import { connectShapes, connectShapeToPoint } from '../../features/layout/manhattanLayout';
import { useStore } from '../../store/state';
import { edgesSelector, nodesSelector, nodeValidatorsSelector, transformSelector } from '../../store/selectors';

export interface HandleProps {
  node: Node;
  shouldShowHandle: boolean;
  additionalEdgeProps: Partial<Edge>;
}

const Handle: React.FC<HandleProps> = React.memo(({ children, node, shouldShowHandle, additionalEdgeProps = { type: 'standardEdge' } }) => {
  const nodes = useStore(nodesSelector);
  const edges = useStore(edgesSelector);
  const transform = useStore(transformSelector);
  const nodeValidators = useStore(nodeValidatorsSelector);
  const upsertEdge = useStore(state => state.upsertEdge);
  const setEdges = useStore(state => state.setEdges);
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
  }, [isPressed, isAddingEdge, transform, nodes, nodeValidators]);

  useEffect(() => {
    if (!isPressed) return;

    document.addEventListener('mouseup', handleDragStop);
    document.addEventListener('touchend', handleDragStop);

    return () => {
      document.removeEventListener('mouseup', handleDragStop);
      document.removeEventListener('touchend', handleDragStop);
    }
  }, [isPressed, edges]);

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const sourceRectangle: Rectangle = {
      x: node.position.x,
      y: node.position.y,
      width: node.width!,
      height: node.height!,
    };

    const canvas = getCanvas(transform);

    const cursorPosition = eventPointToCanvasCoordinates(e)(canvas);

    let targetRectangle: Rectangle;

    const targetNode = nodes.find(whichNode => {
      targetRectangle = {
        x: whichNode.position.x,
        y: whichNode.position.y,
        width: whichNode.width!,
        height: whichNode.height!,
      };

      return isPointInRect(cursorPosition, targetRectangle);
    });

    let waypoints: Point[];
    let newEdge: Partial<Edge> = {
      id: `e${node.id}-?`,
      source: node.id,
      target: '?',
      arrowHeadType: ArrowHeadType.ArrowClosed,
      isForming: true,
      ...additionalEdgeProps,
    };

    if (targetNode) {
      waypoints = connectShapes(sourceRectangle, targetRectangle!, node.shapeType, targetNode.shapeType, undefined, cursorPosition, { preferredLayouts: [LayoutType.VERTICAL_VERTICAL] });
      newEdge.target = targetNode.id;
      newEdge.waypoints = waypoints;

      const nodeValidator = nodeValidators[node.type || 'standardNode'];

      if (typeof nodeValidator === 'function') {
        const { isValid } = nodeValidator(node, targetNode, newEdge as Edge);

        if (!isValid) newEdge.isInvalid = true;
        else delete newEdge.isInvalid;
      }
    } else {
      waypoints = connectShapeToPoint(sourceRectangle, node.shapeType, cursorPosition);
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

    let newEdges = edges.map(edge => {
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
