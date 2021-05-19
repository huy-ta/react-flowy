import { ComponentType } from 'react';

import wrapNode from '../../components/Nodes/wrapNode';
import { NodeTypesType, NodeComponentProps } from '../../types';

export function createNodeTypes(nodeTypes: NodeTypesType): NodeTypesType {
  const wrappedTypes = {} as NodeTypesType;
  const specialTypes: NodeTypesType = Object.keys(nodeTypes)
    .filter(k => !['input', 'default', 'output'].includes(k))
    .reduce((res, key) => {
      res[key] = wrapNode((nodeTypes[key]) as ComponentType<
        NodeComponentProps
      >);

      return res;
    }, wrappedTypes);

  return {
    ...specialTypes,
  };
}
