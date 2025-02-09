import { createMachine, assign, AnyActorRef } from 'xstate';
import { dialogMachineA } from '../A/dialogMachineA';
import { dialogMachineB } from '../B/dialogMachineB';
import { simpleDialogMachineB } from '../B/simpleDialogMachineB';

interface TourContext {
  componentA: AnyActorRef | null;
  componentB: AnyActorRef | null;
  componentAComplete: boolean;
  componentBComplete: boolean;
  isTourActive: boolean;
}

type TourEvent =
  | { type: 'START' }
  | { type: 'COMPLETE_A' }
  | { type: 'COMPLETE_B' };

export const tourMachine = createMachine({
  id: 'tour',
  initial: 'idle',
  context: {
    componentA: null,
    componentB: null,
    componentAComplete: false,
    componentBComplete: false,
    isTourActive: false
  },
  states: {
    idle: {
      on: { 
        START: { 
          target: 'componentA', 
          actions: assign({ isTourActive: true }) 
        } 
      }
    },
    componentA: {
      entry: assign({
        componentA: () => dialogMachineA.provide()
      }),
      on: {
        COMPLETE_A: { 
          target: 'componentB', 
          actions: assign({ componentAComplete: true }) 
        }
      }
    },
    componentB: {
      entry: assign((context) => ({
        componentB: context.isTourActive
          ? simpleDialogMachineB.provide()
          : dialogMachineB.provide()
      })),
      on: {
        COMPLETE_B: { 
          target: 'complete', 
          actions: assign({ componentBComplete: true }) 
        }
      }
    },
    complete: {
      type: 'final',
      entry: assign({ isTourActive: false })
    }
  }
} satisfies import('xstate').StateMachine<TourContext, any, TourEvent>); 