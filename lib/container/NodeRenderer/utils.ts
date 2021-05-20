import { ComponentType } from 'react';

import wrapNode from '../../components/Nodes/wrapNode';
import { NodeTypesType, NodeComponentProps } from '../../types';

export function createNodeTypes(nodeTypes: NodeTypesType): NodeTypesType {
  const wrappedTypes = {} as NodeTypesType;

  return Object.keys(nodeTypes)
    .reduce((res, key) => {
      res[key] = wrapNode((nodeTypes[key]) as ComponentType<
        NodeComponentProps
      >);

      return res;
    }, wrappedTypes);
}
