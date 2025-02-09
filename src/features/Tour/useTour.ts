// useTour.ts
import { useMachine } from '@xstate/react';
import { tourMachine } from './tourMachine';

export const useTour = () => {
  const [, send] = useMachine(tourMachine);

  return {
    startTour: () => send({ type: 'START' }),
  };
};
