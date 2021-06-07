import React, { useLayoutEffect, useEffect, useState } from 'react';

interface MarkerProps {
  id: string;
}

const Marker: React.FC<MarkerProps> = React.memo(({ id, children }) => (
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
));

export interface MarkerObject {
  id: string;
  element: JSX.Element;
}

type AddMarkerDefinition = (id: string, markerElement: JSX.Element) => void;

let addMarkerDefinitionFn: AddMarkerDefinition;

export const addMarkerDefinition: AddMarkerDefinition = (id, markerElement) => {
  addMarkerDefinitionFn(id, markerElement);
};

const MarkerDefinitions: React.FC = () => {
  const [markerObjects, setMarkerObjects] = useState<MarkerObject[]>([]);

  useLayoutEffect(() => {
    setMarkerObjects([...markerObjects, {
      id: 'react-flowy__arrowclosed',
      element:
        <polyline
          className="react-flowy__arrowclosed"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          points="-5,-4 0,0 -5,4 -5,-4"
        />,
    }, {
      id: 'react-flowy__arrow',
      element: 
        <polyline
          className="react-flowy__arrow"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          points="-5,-4 0,0 -5,4"
        />,
    }, {
      id: 'react-flowy__arrowclosed--error',
      element:
        <polyline
          className="react-flowy__arrowclosed--error"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          points="-5,-4 0,0 -5,4 -5,-4"
        />
    }]);
  }, []);

  useEffect(() => {
    addMarkerDefinitionFn = (id: string, markerElement: JSX.Element) => {
      setMarkerObjects(markerObjects => ([...markerObjects, {
        id,
        element: markerElement,
      }]));
    };
  }, []);

  return (
    <defs>
      {markerObjects.map(markerObject => (
        <Marker key={markerObject.id} id={markerObject.id}>
          {markerObject.element}
        </Marker>
      ))}
    </defs>
  );
};

MarkerDefinitions.displayName = 'MarkerDefinitions';

export default React.memo(MarkerDefinitions);
