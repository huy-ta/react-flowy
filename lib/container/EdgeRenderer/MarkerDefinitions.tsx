import React, { ReactNode } from 'react';

interface MarkerProps {
  id: string;
  children: ReactNode;
}

const Marker = ({ id, children }: MarkerProps) => (
  <marker
    className="react-flowy__arrowhead"
    id={id}
    markerWidth="12.5"
    markerHeight="12.5"
    viewBox="-10 -10 20 20"
    orient="auto"
    refX="0"
    refY="0"
  >
    {children}
  </marker>
);

interface MarkerDefinitionsProps {
  color: string;
}

const MarkerDefinitions = ({ color }: MarkerDefinitionsProps) => {
  return (
    <defs>
      <Marker id="react-flowy__arrowclosed">
        <polyline
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill={color}
          points="-5,-4 0,0 -5,4 -5,-4"
        />
      </Marker>
      <Marker id="react-flowy__arrow">
        <polyline
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          fill="none"
          points="-5,-4 0,0 -5,4"
        />
      </Marker>
      <Marker id="react-flowy__arrowclosed--error">
        <polyline
          style={{ stroke: '#ef4a3c', fill: '#ef4a3c' }}
          stroke="#ef4a3c"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill="#ef4a3c"
          points="-5,-4 0,0 -5,4 -5,-4"
        />
      </Marker>
    </defs>
  );
};

MarkerDefinitions.displayName = 'MarkerDefinitions';

export default MarkerDefinitions;
