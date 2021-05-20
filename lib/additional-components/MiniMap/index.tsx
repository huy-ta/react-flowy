import React, { memo, HTMLAttributes, CSSProperties } from 'react';
import { useSnapshot } from 'valtio';
import cc from 'classcat';

import { getRectOfNodes, getBoundsofRects } from '../../utils/graph';
import { Node, Rect } from '../../types';
import MiniMapNode from './MiniMapNode';
import { state } from '../../store/state';

type StringFunc = (node: Node) => string;

export interface MiniMapProps extends HTMLAttributes<SVGSVGElement> {
  nodeColor?: string | StringFunc;
  nodeStrokeColor?: string | StringFunc;
  nodeClassName?: string | StringFunc;
  nodeBorderRadius?: number;
  nodeStrokeWidth?: number;
  maskColor?: string;
}

declare const window: any;

const defaultWidth = 200;
const defaultHeight = 150;

const MiniMap = ({
  style,
  className,
  nodeStrokeColor = '#555',
  nodeColor = '#fff',
  nodeClassName = '',
  nodeBorderRadius = 5,
  nodeStrokeWidth = 2,
  maskColor = 'rgb(240, 242, 243, 0.7)',
}: MiniMapProps) => {
  const snap = useSnapshot(state);
  const containerWidth = snap.width;
  const containerHeight = snap.height;
  const [tX, tY, tScale] = snap.transform;
  const nodes = snap.nodes as Node[];

  const mapClasses = cc(['react-flowy__minimap', className]);
  const elementWidth = (style?.width || defaultWidth)! as number;
  const elementHeight = (style?.height || defaultHeight)! as number;
  const nodeColorFunc = (nodeColor instanceof Function ? nodeColor : () => nodeColor) as StringFunc;
  const nodeStrokeColorFunc = (nodeStrokeColor instanceof Function
    ? nodeStrokeColor
    : () => nodeStrokeColor) as StringFunc;
  const nodeClassNameFunc = (nodeClassName instanceof Function ? nodeClassName : () => nodeClassName) as StringFunc;
  const hasNodes = nodes && nodes.length;
  const bb = getRectOfNodes(nodes);
  const viewBB: Rect = {
    x: -tX / tScale,
    y: -tY / tScale,
    width: containerWidth / tScale,
    height: containerHeight / tScale,
  };
  const boundingRect = hasNodes ? getBoundsofRects(bb, viewBB) : viewBB;
  const scaledWidth = boundingRect.width / elementWidth;
  const scaledHeight = boundingRect.height / elementHeight;
  const viewScale = Math.max(scaledWidth, scaledHeight);
  const viewWidth = viewScale * elementWidth;
  const viewHeight = viewScale * elementHeight;
  const offset = 5 * viewScale;
  const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
  const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
  const width = viewWidth + offset * 2;
  const height = viewHeight + offset * 2;
  const shapeRendering = (typeof window === "undefined" || !!window.chrome) ?  "crispEdges" : "geometricPrecision";

  return (
    <svg
      width={elementWidth}
      height={elementHeight}
      viewBox={`${x} ${y} ${width} ${height}`}
      style={style}
      className={mapClasses}
    >
      {nodes
        .filter((node) => !node.isHidden)
        .map((node) => (
          <MiniMapNode
            key={node.id}
            x={node.__rf.position.x}
            y={node.__rf.position.y}
            width={node.__rf.width}
            height={node.__rf.height}
            style={node.style as CSSProperties}
            className={nodeClassNameFunc(node)}
            color={nodeColorFunc(node)}
            borderRadius={nodeBorderRadius}
            strokeColor={nodeStrokeColorFunc(node)}
            strokeWidth={nodeStrokeWidth}
            shapeRendering={shapeRendering}
          />
        ))}
      <path
        className="react-flowy__minimap-mask"
        d={`M${x - offset},${y - offset}h${width + offset * 2}v${height + offset * 2}h${-width - offset * 2}z
        M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`}
        fill={maskColor}
        fillRule="evenodd"
      />
    </svg>
  );
};

MiniMap.displayName = 'MiniMap';

export default memo(MiniMap);
