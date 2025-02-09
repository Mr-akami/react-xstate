// useTour.ts
import { useMachine, useSelector } from '@xstate/react';
import { useEffect } from 'react';
import { tourMachine } from './tourMachine';
import { dialogActor } from '../A/useDialogA';
import { dialogActorB } from '../B/useDialogB';

export const useTour = () => {
  const [state, send] = useMachine(tourMachine);

  // ダイアログAおよびBの状態をそれぞれ監視する
  const isDialogAComplete = useSelector(dialogActor, (dialogState) => dialogState.matches('complete'));
  const isDialogBComplete = useSelector(dialogActorB, (dialogState) => dialogState.matches('complete'));

  // ダイアログAが完了していて、かつツアーが ComponentA 状態にある場合に COMPLETE_A イベントを送信
  useEffect(() => {
    if (isDialogAComplete && state.matches('componentA')) {
      send({ type: 'COMPLETE_A' });
    }
  }, [isDialogAComplete, state, send]);

  // ダイアログBが完了していて、かつツアーが ComponentB 状態にある場合に COMPLETE_B イベントを送信
  useEffect(() => {
    if (isDialogBComplete && state.matches('componentB')) {
      send({ type: 'COMPLETE_B' });
    }
  }, [isDialogBComplete, state, send]);

  return {
    // ツアーが idle 状態でなければツアーがアクティブ
    isTourActive: !state.matches('idle'),
    // ツアーマシンの現在の状態に応じたフラグ
    isInComponentA: state.matches('componentA'),
    isInComponentB: state.matches('componentB'),
    // ツアー開始、完了用のイベント送信関数
    startTour: () => send({ type: 'START' }),
    completeA: () => send({ type: 'COMPLETE_A' }),
    completeB: () => send({ type: 'COMPLETE_B' }),
    // ダイアログに対して操作を行うための参照（必要に応じて利用）
    componentARef: state.context.componentA,
    componentBRef: state.context.componentB,
  };
};
