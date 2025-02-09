import { useMachine } from '@xstate/react';
import { useAtom } from 'jotai';
import { dialogMachineA } from './dialogMachineA';
import { componentATotalAtom } from '../Tour/atoms';

export const useDialogA = () => {
  const [state, send] = useMachine(dialogMachineA, {});
  const [totalA, setTotalA] = useAtom(componentATotalAtom);

  const handleSelect = (value: number) => {
    send({ type: 'SELECT', value });
  };

  const handleSave = () => {
    setTotalA(state.context.total);
    send({ type: 'RESET' });
  };

  return {
    isOpen: state.matches('open'),
    isComplete: state.matches('complete'),
    handleSelect,
    handleSave,
    openDialog: () => send({ type: 'OPEN' }),
    total: totalA,
    count: state.context.count,
    currentTotal: state.context.total
  };
}; 