import { createMachine, assign, AnyActorRef, fromCallback } from 'xstate';
import { dialogActorA } from '../A/useDialogA';
import { dialogActorB } from '../B/useDialogB';

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
  | { type: 'COMPLETE_B' }
  | { type: 'RESET' };

export const tourMachine = createMachine({
  types: {} as {
    context: TourContext;
    events: TourEvent;
  },
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
      entry: assign({
        componentA: null,
        componentB: null,
        componentAComplete: false,
        componentBComplete: false,
        isTourActive: false
      }),
      on: { 
        START: { 
          target: 'componentA', 
          actions: assign({ isTourActive: true }) 
        } 
      }
    },
    componentA: {
      entry: assign({
        componentA: () => dialogActorA
      }),
      invoke: {
        id: 'dialogASubscription',
        src: fromCallback(({ sendBack }) => {
          const subscription = dialogActorA.subscribe((state) => {
            if (state.matches('complete')) {
              sendBack({ type: 'COMPLETE_A' });
            }
          });
          return subscription.unsubscribe;
        })
      },
      on: {
        COMPLETE_A: { 
          target: 'componentB', 
          actions: assign({ componentAComplete: true })
        }
      }
    },
    componentB: {
      entry: assign({
        componentB: () => dialogActorB
      }),
      invoke: {
        id: 'dialogBSubscription',
        src: fromCallback(({ sendBack }) => {
          const subscription = dialogActorB.subscribe((state) => {
            if (state.matches('complete')) {
              sendBack({ type: 'COMPLETE_B' });
            }
          });
          return subscription.unsubscribe;
        })
      },
      on: {
        COMPLETE_B: { 
          target: 'idle', 
          actions: assign({ componentBComplete: true }) 
        }
      }
    }
  }
}); 