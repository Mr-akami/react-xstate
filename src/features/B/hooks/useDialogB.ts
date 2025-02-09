import { useMachine } from '@xstate/react';
import { useAtom } from 'jotai';
import { dialogMachineB } from '../machines/dialogMachineB';
import { componentBTotalAtom } from '../../Tour/atoms';

export const useDialogB = () => {
  const [state, send] = useMachine(dialogMachineB);
  const [totalB, setTotalB] = useAtom(componentBTotalAtom);

  const handleSelect = (value: number) => {
    send({ type: 'SELECT', value });
  };

  const handleSave = () => {
    setTotalB(state.context.total);
    send({ type: 'RESET' });
  };

  return {
    isOpen: state.matches('open'),
    isComplete: state.matches('complete'),
    handleSelect,
    handleSave,
    openDialog: () => send({ type: 'OPEN' }),
    total: totalB,
    count: state.context.count,
    currentTotal: state.context.total
  };
};
