import React, { useEffect } from 'react';
import { useTour } from './useTour';

const TourComponent: React.FC = () => {
  const { startTour, isInComponentA, isInComponentB, componentARef, componentBRef } = useTour();

  useEffect(() => {
    if (isInComponentA && componentARef) {
      componentARef.send({ type: 'OPEN' });
    }
  }, [isInComponentA, componentARef]);

  useEffect(() => {
    if (isInComponentB && componentBRef) {
      componentBRef.send({ type: 'OPEN' });
    }
  }, [isInComponentB, componentBRef]);

  return <button onClick={startTour}>Start Tour</button>;
};

export default TourComponent;
