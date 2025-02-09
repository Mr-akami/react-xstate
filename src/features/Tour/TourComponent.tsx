import React from 'react';
import { useTour } from './useTour';

const TourComponent: React.FC = () => {
  const { startTour} = useTour();
  
  return <button onClick={startTour}>Start Tour</button>;
};

export default TourComponent;
