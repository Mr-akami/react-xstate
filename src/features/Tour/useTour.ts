import { useAtom } from 'jotai';
import { tourServiceAtom } from './atoms';

export const useTour = () => {
  const [state, send] = useAtom(tourServiceAtom);

  const startTour = () => send({ type: 'START' });
  const completeA = () => send({ type: 'COMPLETE_A' });
  const completeB = () => send({ type: 'COMPLETE_B' });

  return {
    isTourActive: !state.matches('idle'),
    isInComponentA: state.matches('componentA'),
    isInComponentB: state.matches('componentB'),
    startTour,
    completeA,
    completeB,
    componentARef: state.context.componentA,
    componentBRef: state.context.componentB
  };
}; 