import React from 'react';
import { useTour } from './useTour';

const TourComponent: React.FC = () => {
  const { startTour, isTourActive } = useTour();

  return (
    <div>
      <button onClick={startTour} disabled={isTourActive}>
        {isTourActive ? 'Tour in Progress...' : 'Start Tour'}
      </button>
    </div>
  );
};

export default TourComponent; 