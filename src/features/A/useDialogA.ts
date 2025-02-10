import { useSelector } from '@xstate/react';
import { useAtom } from 'jotai';
import { dialogActorA } from './dialogMachineA';
import { componentATotalAtom } from '../Tour/atoms';



export const useDialogA = () => {
  const [totalA, setTotalA] = useAtom(componentATotalAtom);

  const isOpen = useSelector(dialogActorA, state => state.matches('open'));
  const isComplete = useSelector(dialogActorA, state => state.matches('complete'));
  const count = useSelector(dialogActorA, state => state.context.count);
  const currentTotal = useSelector(dialogActorA, state => state.context.total);
  

  const handleSelect = (value: number) => {
    dialogActorA.send({ type: 'SELECT', value });
  };

  const handleSave = () => {
    setTotalA(currentTotal);
    dialogActorA.send({ type: 'RESET' });
  };

  return {
    isOpen,
    isComplete,
    handleSelect,
    handleSave,
    openDialog: () => dialogActorA.send({ type: 'OPEN' }),
    total: totalA,
    count,
    currentTotal
  };
}; 