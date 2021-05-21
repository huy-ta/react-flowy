import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  memo,
  ComponentType,
  CSSProperties,
  useMemo,
  MouseEvent,
  useCallback,
} from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import cc from 'classcat';

import { Provider } from '../../contexts/NodeIdContext';
import { Axis, ElementId, Node, SnapGrid, Transform } from '../../types';
import { updateNodeDimensions, updateNodePosDiff } from '../../store/actions';
import useKeyPress from '../../hooks/useKeyPress';

export interface NodeComponentProps<T = any> {
  id: ElementId;
  type: string;
  data: T;
  isConnectable: boolean;
  transform?: Transform;
  xPos?: number;
  yPos?: number;
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
  isDragging?: boolean;
}

export interface WrapNodeProps<T = any> {
  id: ElementId;
  type: string;
  data: T;
  scale: number;
  xPos: number;
  yPos: number;
  isDraggable: boolean;
  isConnectable: boolean;
  onClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onMouseEnter?: (event: React.MouseEvent, node: Node) => void;
  onMouseMove?: (event: React.MouseEvent, node: Node) => void;
  onMouseLeave?: (event: React.MouseEvent, node: Node) => void;
  onContextMenu?: (event: React.MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: React.MouseEvent, node: Node) => void;
  onNodeDrag?: (event: React.MouseEvent, node: Node, draggableData: DraggableData) => void;
  onNodeDragStop?: (event: React.MouseEvent, node: Node) => void;
  style?: CSSProperties;
  className?: string;
  isHidden?: boolean;
  isInitialized?: boolean;
  snapToGrid?: boolean;
  snapGrid?: SnapGrid;
  isDragging?: boolean;
  resizeObserver: ResizeObserver | null;
}

export default (NodeComponent: ComponentType<NodeComponentProps>) => {
  const NodeWrapper = ({
    id,
    type,
    data,
    scale,
    xPos,
    yPos,
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
    isConnectable,
    isHidden,
    isInitialized,
    snapToGrid,
    snapGrid,
    isDragging,
    resizeObserver,
  }: WrapNodeProps) => {
    const observerInitialized = useRef<boolean>(false);
    const isShiftPressed = useKeyPress('Shift');
    const draggingAxis = useRef<Axis>();

    const nodeElement = useRef<HTMLDivElement>(null);

    const node = useMemo(() => ({ id, type, position: { x: xPos, y: yPos }, data }), [id, type, xPos, yPos, data]);
    const grid = useMemo(() => (snapToGrid ? snapGrid : [1, 1])! as [number, number], [snapToGrid, snapGrid]);

    const nodeStyle: CSSProperties = useMemo(
      () => ({
        zIndex: 3,
        transform: `translate(${xPos}px,${yPos}px)`,
        pointerEvents:
          isDraggable || onClick || onMouseEnter || onMouseMove || onMouseLeave ? 'all' : 'none',
        // prevents jumping of nodes on start
        opacity: isInitialized ? 1 : 0,
        ...style,
      }),
      [
        xPos,
        yPos,
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
      if (!onMouseEnter || isDragging) {
        return;
      }

      return (event: MouseEvent) => onMouseEnter(event, node);
    }, [onMouseEnter, isDragging, node]);

    const onMouseMoveHandler = useMemo(() => {
      if (!onMouseMove || isDragging) {
        return;
      }

      return (event: MouseEvent) => onMouseMove(event, node);
    }, [onMouseMove, isDragging, node]);

    const onMouseLeaveHandler = useMemo(() => {
      if (!onMouseLeave || isDragging) {
        return;
      }

      return (event: MouseEvent) => onMouseLeave(event, node);
    }, [onMouseLeave, isDragging, node]);

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

        if (onNodeDrag) {
          node.position.x += deltaX;
          node.position.y += deltaY;
          onNodeDrag(event as MouseEvent, node, draggableData);
        }

        updateNodePosDiff({
          id,
          diff: {
            x: deltaX,
            y: deltaY,
          },
          isDragging: true,
        });
      },
      [id, node, onNodeDrag, isShiftPressed, draggingAxis]
    );

    const onDragStop = useCallback(
      (event: DraggableEvent) => {
        // onDragStop also gets called when user just clicks on a node.
        // Because of that we set dragging to true inside the onDrag handler and handle the click here
        if (!isDragging) {
          onClick?.(event as MouseEvent, node);

          return;
        }

        updateNodePosDiff({
          id: node.id,
          isDragging: false,
        });

        onNodeDragStop?.(event as MouseEvent, node);
      },
      [node, onClick, onNodeDragStop, isDragging]
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
      if (nodeElement.current && !isHidden && observerInitialized.current) {
        updateNodeDimensions([{ id, nodeElement: nodeElement.current, forceUpdate: true }]);
      }
    }, [id, isHidden]);

    useEffect(() => {
      if (nodeElement.current) {
        observerInitialized.current = true;
        const currNode = nodeElement.current;
        resizeObserver?.observe(currNode);

        return () => resizeObserver?.unobserve(currNode);
      }
    }, []);

    if (isHidden) {
      return null;
    }

    const nodeClasses = cc([
      'react-flowy__node',
      `react-flowy__node-${type}`,
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
          data-id={id}
        >
          <Provider value={id}>
            <NodeComponent
              id={id}
              data={data}
              type={type}
              xPos={xPos}
              yPos={yPos}
              isConnectable={isConnectable}
              isDragging={isDragging}
            />
          </Provider>
        </div>
      </DraggableCore>
    );
  };

  NodeWrapper.displayName = 'NodeWrapper';

  return memo(NodeWrapper);
};
