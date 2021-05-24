import React, { useMemo, ComponentType, MouseEvent, CSSProperties } from 'react';

import { Node, NodeTypesType, Edge, DragDelta } from '../../types';
import { useStore } from '../../store/state';
import { WrapNodeProps } from '../../components/Nodes/wrapNode';
import { nodesConnectableSelector, nodesDraggableSelector, nodesSelector, transformSelector } from '../../store/selectors';

interface NodeRendererProps {
  nodeTypes: NodeTypesType;
  onElementClick?: (event: MouseEvent, element: Node | Edge) => void;
  onNodeDoubleClick?: (event: MouseEvent, element: Node) => void;
  onNodeMouseEnter?: (event: MouseEvent, node: Node) => void;
  onNodeMouseMove?: (event: MouseEvent, node: Node) => void;
  onNodeMouseLeave?: (event: MouseEvent, node: Node) => void;
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: MouseEvent, node: Node) => void;
  onNodeDrag?: (event: MouseEvent, node: Node, dragDelta: DragDelta) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node) => void;
  snapToGrid: boolean;
  snapGrid: [number, number];
}

const NodeRenderer = (props: NodeRendererProps) => {
  const transform = useStore(transformSelector);
  const nodes = useStore(nodesSelector);
  const nodesDraggable = useStore(nodesDraggableSelector);
  const nodesConnectable = useStore(nodesConnectableSelector);
  const updateNodeDimensions = useStore(state => state.updateNodeDimensions);

  const transformStyle = useMemo(
    () => ({
      transform: `translate(${transform[0]}px,${transform[1]}px) scale(${transform[2]})`,
    }),
    [transform[0], transform[1], transform[2]]
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
      {nodes.map(node => {
        const nodeType = node.type || 'default';
        const NodeComponent = (props.nodeTypes[nodeType] || props.nodeTypes.default) as ComponentType<WrapNodeProps>;

        if (!props.nodeTypes[nodeType]) {
          console.warn(`Node type "${nodeType}" not found. Using fallback type "default".`);
        }

        const isDraggable = !!(node.draggable || (nodesDraggable && typeof node.draggable === 'undefined'));
        const isConnectable = !!(node.connectable || (nodesConnectable && typeof node.connectable === 'undefined'));

        return (
          <NodeComponent
            key={node.id}
            id={node.id}
            className={node.className}
            style={node.style as CSSProperties}
            type={nodeType}
            data={node.data}
            isHidden={node.isHidden}
            isSelected={node.isSelected}
            position={{ x: node.position.x, y: node.position.y }}
            isDragging={node.isDragging}
            isInitialized={!!node.width || !!node.height}
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
            scale={transform[2]}
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

export default React.memo(NodeRenderer);
