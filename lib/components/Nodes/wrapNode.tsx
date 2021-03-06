import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  ComponentType,
  CSSProperties,
  useMemo,
  MouseEvent,
  useCallback,
} from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import cc from 'classcat';

import { Axis, DragDelta, Node, SnapGrid, Transform } from '../../types';
import useKeyPress from '../../hooks/useKeyPress';
import { useStoreById } from '../../store/state';

export interface NodeComponentProps<T = any> {
  node: Node<T>;
  transform?: Transform;
  onClick?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node) => void;
  onMouseEnter?: (node: Node) => void;
  onMouseMove?: (node: Node) => void;
  onMouseLeave?: (node: Node) => void;
  onContextMenu?: (node: Node) => void;
  onNodeDragStart?: (node: Node) => void;
  onNodeDrag?: (node: Node) => void;
  onNodeDragStop?: (node: Node) => void;
  style?: CSSProperties;
  storeId: string;
}

export interface WrapNodeProps<T = any> {
  node: Node<T>;
  scale: number;
  isDraggable: boolean;
  isConnectable: boolean;
  onClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onMouseEnter?: (event: React.MouseEvent, node: Node) => void;
  onMouseMove?: (event: React.MouseEvent, node: Node) => void;
  onMouseLeave?: (event: React.MouseEvent, node: Node) => void;
  onContextMenu?: (event: React.MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: React.MouseEvent, node: Node) => void;
  onNodeDrag?: (event: React.MouseEvent, node: Node, dragDelta: DragDelta) => void;
  onNodeDragStop?: (event: React.MouseEvent, node: Node) => void;
  style?: CSSProperties;
  className?: string;
  isInitialized?: boolean;
  snapToGrid?: boolean;
  snapGrid?: SnapGrid;
  resizeObserver: ResizeObserver | null;
  storeId: string;
}

export default (NodeComponent: ComponentType<NodeComponentProps>) => {
  const NodeWrapper = ({
    node,
    scale,
    onClick,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onContextMenu,
    onNodeDoubleClick,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    style,
    className,
    isDraggable,
    isInitialized,
    snapToGrid,
    snapGrid,
    resizeObserver,
    storeId,
  }: WrapNodeProps) => {
    const useStore = useStoreById(storeId)!;
    const updateNodeDimensions = useStore(state => state.updateNodeDimensions);
    const updateNodePosDiff = useStore(state => state.updateNodePosDiff);
    const observerInitialized = useRef<boolean>(false);
    const isShiftPressed = useKeyPress('Shift');
    const draggingAxis = useRef<Axis>();

    const nodeElement = useRef<HTMLDivElement>(null);

    const grid = useMemo(() => (snapToGrid ? snapGrid : [1, 1])! as [number, number], [snapToGrid, snapGrid]);

    const nodeStyle: CSSProperties = useMemo(
      () => ({
        zIndex: 3,
        transform: `translate(${node.position.x}px,${node.position.y}px)`,
        pointerEvents:
          isDraggable || onClick || onMouseEnter || onMouseMove || onMouseLeave ? 'all' : 'none',
        // prevents jumping of nodes on start
        opacity: isInitialized ? 1 : 0,
        ...style,
      }),
      [
        node.position,
        isDraggable,
        onClick,
        isInitialized,
        style,
        onMouseEnter,
        onMouseMove,
        onMouseLeave,
      ]
    );
    const onMouseEnterHandler = useMemo(() => {
      if (!onMouseEnter || node.isDragging) {
        return;
      }

      return (event: MouseEvent) => onMouseEnter(event, node);
    }, [onMouseEnter, node.isDragging, node]);

    const onMouseMoveHandler = useMemo(() => {
      if (!onMouseMove || node.isDragging) {
        return;
      }

      return (event: MouseEvent) => onMouseMove(event, node);
    }, [onMouseMove, node.isDragging, node]);

    const onMouseLeaveHandler = useMemo(() => {
      if (!onMouseLeave || node.isDragging) {
        return;
      }

      return (event: MouseEvent) => onMouseLeave(event, node);
    }, [onMouseLeave, node.isDragging, node]);

    const onContextMenuHandler = useMemo(() => {
      if (!onContextMenu) {
        return;
      }

      return (event: MouseEvent) => onContextMenu(event, node);
    }, [onContextMenu, node]);

    const onDragStart = useCallback(
      (event: DraggableEvent) => {
        draggingAxis.current = undefined;
        onNodeDragStart?.(event as MouseEvent, node);
      },
      [node, onNodeDragStart]
    );

    const onDrag = useCallback(
      (event: DraggableEvent, draggableData: DraggableData) => {
        let deltaX = draggableData.deltaX;
        let deltaY = draggableData.deltaY;

        if (isShiftPressed.current && !draggingAxis.current) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) draggingAxis.current = Axis.X;
          else if (Math.abs(deltaY) > Math.abs(deltaX)) draggingAxis.current = Axis.Y;
        }

        if (draggingAxis.current === Axis.X) {
          deltaY = 0;

          if (deltaX === 0) return;
        } else if (draggingAxis.current === Axis.Y) {
          deltaX = 0;

          if (deltaY === 0) return;
        }

        updateNodePosDiff({
          id: node.id,
          diff: {
            x: deltaX,
            y: deltaY,
          },
          isDragging: true,
        });

        if (typeof onNodeDrag === 'function') {
          onNodeDrag(event as MouseEvent, node, { deltaX, deltaY });
        }
      },
      [node, node.id, node.position.x, node.position.y, onNodeDrag]
    );

    const onDragStop = useCallback(
      (event: DraggableEvent) => {
        // onDragStop also gets called when user just clicks on a node.
        // Because of that we set dragging to true inside the onDrag handler and handle the click here
        if (!node.isDragging) {
          onClick?.(event as MouseEvent, node);

          return;
        }

        updateNodePosDiff({
          id: node.id,
          isDragging: false,
        });

        onNodeDragStop?.(event as MouseEvent, node);
      },
      [node, node.id, node.isDragging, onClick, onNodeDragStop]
    );

    const onNodeDoubleClickHandler = useCallback(
      (event: MouseEvent) => {
        onNodeDoubleClick?.(event, node);
      },
      [node, onNodeDoubleClick]
    );

    useLayoutEffect(() => {
      // the resize observer calls an updateNodeDimensions initially.
      // We don't need to force another dimension update if it hasn't happened yet
      if (nodeElement.current && !node.isHidden && observerInitialized.current) {
        updateNodeDimensions([{ id: node.id, nodeElement: nodeElement.current, forceUpdate: true }]);
      }
    }, [node.id, node.isHidden]);

    useEffect(() => {
      if (!nodeElement.current) return;

      observerInitialized.current = true;
      const currNode = nodeElement.current;
      resizeObserver?.observe(currNode);

      return () => resizeObserver?.unobserve(currNode);
    }, []);

    if (node.isHidden) {
      return null;
    }

    const nodeClasses = cc([
      'react-flowy__node',
      `react-flowy__node-${node.type}`,
      className,
    ]);

    return (
      <DraggableCore
        onStart={onDragStart}
        onDrag={onDrag}
        onStop={onDragStop}
        scale={scale}
        disabled={!isDraggable}
        cancel=".nodrag"
        nodeRef={nodeElement}
        grid={grid}
      >
        <div
          className={nodeClasses}
          ref={nodeElement}
          style={nodeStyle}
          onMouseEnter={onMouseEnterHandler}
          onMouseMove={onMouseMoveHandler}
          onMouseLeave={onMouseLeaveHandler}
          onContextMenu={onContextMenuHandler}
          onDoubleClick={onNodeDoubleClickHandler}
          data-id={node.id}
        >
          <NodeComponent node={node} storeId={storeId} />
        </div>
      </DraggableCore>
    );
  };

  NodeWrapper.displayName = 'NodeWrapper';

  return React.memo(NodeWrapper);
};
