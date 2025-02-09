import { useMachine } from '@xstate/react';
import { tourMachine } from './tourMachine';
import { useSelector } from '@xstate/react';
import { dialogActor } from '../A/useDialogA';
import { dialogActorB } from '../B/useDialogB';

export const useTour = () => {
  const [state, send] = useMachine(tourMachine);

  const isDialogAComplete = useSelector(dialogActor, state => state.matches('complete'));
  if (isDialogAComplete && state.matches('componentA')) {
    send({ type: 'COMPLETE_A' });
  }

  const isDialogBComplete = useSelector(dialogActorB, state => state.matches('complete'));
  if (isDialogBComplete && state.matches('componentB')) {
    send({ type: 'COMPLETE_B' });
  }

  return {
    isTourActive: !state.matches('idle'),
    isInComponentA: state.matches('componentA'),
    isInComponentB: state.matches('componentB'),
    startTour: () => send({ type: 'START' }),
    completeA: () => send({ type: 'COMPLETE_A' }),
    completeB: () => send({ type: 'COMPLETE_B' }),
    componentARef: state.context.componentA,
    componentBRef: state.context.componentB
  };
}; 