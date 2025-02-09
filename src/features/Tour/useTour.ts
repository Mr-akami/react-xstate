import { useMachine } from '@xstate/react';
import { tourMachine } from './tourMachine';

export const useTour = () => {
  const [state, send] = useMachine(tourMachine);

  return {
    isTourActive: !state.matches('idle'),
    isInComponentA: state.matches('componentA'),
    isInComponentB: state.matches('componentB'),
    startTour: () => send({ type: 'START' }),
    completeA: () => send({ type: 'COMPLETE_A' }),
    completeB: () => send({ type: 'COMPLETE_B' }),
    componentA: state.context.componentA,
    componentB: state.context.componentB
  };
}; 