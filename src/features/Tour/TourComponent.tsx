// components/TourComponent.tsx
import React from 'react';
import { useTour } from './useTour';

const TourComponent: React.FC = () => {
  const { startTour, isInComponentA, isInComponentB, completeA, completeB, componentARef, componentBRef } = useTour();

  if (isInComponentA && componentARef) componentARef.send({ type: 'OPEN' });
  if (isInComponentB && componentBRef) componentBRef.send({ type: 'OPEN' });

  return <button onClick={startTour}>Start Tour</button>;
};

export default TourComponent;
