import { useSelector } from '@xstate/react';
import { useAtom } from 'jotai';
import { dialogMachineA } from './dialogMachineA';
import { componentATotalAtom } from '../Tour/atoms';
import { createActor } from 'xstate';

export const dialogActor = createActor(dialogMachineA).start();

export const useDialogA = () => {
  const [totalA, setTotalA] = useAtom(componentATotalAtom);

  const isOpen = useSelector(dialogActor, state => state.matches('open'));
  const isComplete = useSelector(dialogActor, state => state.matches('complete'));
  const count = useSelector(dialogActor, state => state.context.count);
  const currentTotal = useSelector(dialogActor, state => state.context.total);
  

  const handleSelect = (value: number) => {
    dialogActor.send({ type: 'SELECT', value });
  };

  const handleSave = () => {
    setTotalA(currentTotal);
    dialogActor.send({ type: 'RESET' });
  };

  return {
    isOpen,
    isComplete,
    handleSelect,
    handleSave,
    openDialog: () => dialogActor.send({ type: 'OPEN' }),
    total: totalA,
    count,
    currentTotal
  };
}; 