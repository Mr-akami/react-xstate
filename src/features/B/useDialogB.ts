import { useSelector } from '@xstate/react';
import { useAtom } from 'jotai';
import { dialogMachineB } from './dialogMachineB';
import { componentBTotalAtom } from '../Tour/atoms';
import { createActor } from 'xstate';

export const dialogActorB = createActor(dialogMachineB).start();

export const useDialogB = () => {
  const [totalB, setTotalB] = useAtom(componentBTotalAtom);

  const isOpen = useSelector(dialogActorB, state => state.matches('open'));
  const isComplete = useSelector(dialogActorB, state => state.matches('complete'));
  const count = useSelector(dialogActorB, state => state.context.count);
  const currentTotal = useSelector(dialogActorB, state => state.context.total);

  const handleSelect = (value: number) => {
    dialogActorB.send({ type: 'SELECT', value });
  };

  const handleSave = () => {
    setTotalB(currentTotal);
    dialogActorB.send({ type: 'RESET' });
  };

  return {
    isOpen,
    isComplete,
    handleSelect,
    handleSave,
    openDialog: () => dialogActorB.send({ type: 'OPEN' }),
    total: totalB,
    count,
    currentTotal
  };
};
