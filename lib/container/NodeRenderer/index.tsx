import React, { memo, useMemo, ComponentType, MouseEvent, CSSProperties } from 'react';
import { useSnapshot } from 'valtio';

import { Node, NodeTypesType, WrapNodeProps, Edge } from '../../types';
import { DraggableData } from 'react-draggable';
import { state } from '../../store/state';
import { updateNodeDimensions } from '../../store/actions';
interface NodeRendererProps {
  nodeTypes: NodeTypesType;
  onElementClick?: (event: MouseEvent, element: Node | Edge) => void;
  onNodeDoubleClick?: (event: MouseEvent, element: Node) => void;
  onNodeMouseEnter?: (event: MouseEvent, node: Node) => void;
  onNodeMouseMove?: (event: MouseEvent, node: Node) => void;
  onNodeMouseLeave?: (event: MouseEvent, node: Node) => void;
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: MouseEvent, node: Node) => void;
  onNodeDrag?: (event: MouseEvent, node: Node, draggableData: DraggableData) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node) => void;
  snapToGrid: boolean;
  snapGrid: [number, number];
  onlyRenderVisibleElements: boolean;
}

const NodeRenderer = (props: NodeRendererProps) => {
  const snap = useSnapshot(state);

  const transformStyle = useMemo(
    () => ({
      transform: `translate(${snap.transform[0]}px,${snap.transform[1]}px) scale(${snap.transform[2]})`,
    }),
    [snap.transform[0], snap.transform[1], snap.transform[2]]
  );

  const resizeObserver = useMemo(() => {
    if (typeof ResizeObserver === 'undefined') {
      return null;
    }

    return new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const updates = entries.map((entry: ResizeObserverEntry) => ({
        id: entry.target.getAttribute('data-id') as string,
        nodeElement: entry.target as HTMLDivElement,
      }));

      updateNodeDimensions(updates);
    });
  }, []);

  return (
    <div className="react-flowy__nodes" style={transformStyle}>
      {snap.nodes.map(node => {
        const nodeType = node.type || 'default';
        const NodeComponent = (props.nodeTypes[nodeType] || props.nodeTypes.default) as ComponentType<WrapNodeProps>;

        if (!props.nodeTypes[nodeType]) {
          console.warn(`Node type "${nodeType}" not found. Using fallback type "default".`);
        }

        const isDraggable = !!(node.draggable || (snap.nodesDraggable && typeof node.draggable === 'undefined'));
        const isConnectable = !!(node.connectable || (snap.nodesConnectable && typeof node.connectable === 'undefined'));

        return (
          <NodeComponent
            key={node.id}
            id={node.id}
            className={node.className}
            style={node.style as CSSProperties}
            type={nodeType}
            data={node.data}
            isHidden={node.isHidden}
            xPos={node.__rf.position.x}
            yPos={node.__rf.position.y}
            isDragging={node.__rf.isDragging}
            isInitialized={node.__rf.width !== null && node.__rf.height !== null}
            snapGrid={props.snapGrid}
            snapToGrid={props.snapToGrid}
            onClick={props.onElementClick}
            onMouseEnter={props.onNodeMouseEnter}
            onMouseMove={props.onNodeMouseMove}
            onMouseLeave={props.onNodeMouseLeave}
            onContextMenu={props.onNodeContextMenu}
            onNodeDoubleClick={props.onNodeDoubleClick}
            onNodeDragStart={props.onNodeDragStart}
            onNodeDrag={props.onNodeDrag}
            onNodeDragStop={props.onNodeDragStop}
            scale={snap.transform[2]}
            isDraggable={isDraggable}
            isConnectable={isConnectable}
            resizeObserver={resizeObserver}
          />
        );
      })}
    </div>
  );
};

NodeRenderer.displayName = 'NodeRenderer';

export default memo(NodeRenderer);
