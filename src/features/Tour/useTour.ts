// useTour.ts
import { useMachine } from '@xstate/react';
import { useEffect } from 'react';
import { tourMachine } from './tourMachine';

export const useTour = () => {
  const [state, send] = useMachine(tourMachine);

  // 状態やコンテキストを分かりやすく分解
  const isInComponentA = state.matches('componentA');
  const isInComponentB = state.matches('componentB');
  const componentARef = state.context.componentA;
  const componentBRef = state.context.componentB;


  // ツアーが ComponentA 状態になったときにダイアログAを OPEN する
  useEffect(() => {
    if (isInComponentA && componentARef) {
      componentARef.send({ type: 'OPEN' });
    }
  }, [isInComponentA, componentARef]);

  // ツアーが ComponentB 状態になったときにダイアログBを OPEN する
  useEffect(() => {
    if (isInComponentB && componentBRef) {
      componentBRef.send({ type: 'OPEN' });
    }
  }, [isInComponentB, componentBRef]);

  return {
    startTour: () => send({ type: 'START' }),
  };
};
