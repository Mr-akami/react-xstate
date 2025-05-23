import { createMachine, assign, AnyActorRef, fromCallback } from 'xstate';
import { dialogActorA } from '../A/dialogMachineA';
import { dialogActorB } from '../B/dialogMachineB';

interface TourContext {
  componentA: AnyActorRef | null;
  componentB: AnyActorRef | null;
  componentAComplete: boolean;
  componentBComplete: boolean;
  isTourActive: boolean;
}

type TourState =
  | { value: 'idle'; context: TourContext }
  | { value: 'componentA'; context: TourContext }
  | { value: 'componentB'; context: TourContext };

type TourEvent =
  | { type: 'START' }
  | { type: 'COMPLETE_A' }
  | { type: 'COMPLETE_B' }
  | { type: 'RESET' };

export const tourMachine = createMachine({
  types: {} as {
    context: TourContext;
    events: TourEvent;
    states: TourState;
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
      entry: [
        assign({
          componentA: () => dialogActorA
        }),
        ({ context }: { context: TourContext }) => {
          if (context.componentA) {
            context.componentA.send({ type: 'OPEN' });
          }
        }
      ],
      invoke: {
        id: 'dialogASubscription',
        src: fromCallback(({ sendBack }) => {
          const subscription = dialogActorA.subscribe((state) => {
            if (state.matches('closed')) {
              sendBack({ type: 'COMPLETE_A' });
            }
          });
          return subscription.unsubscribe;
        })
      },
      on: {
        COMPLETE_A: { 
          target: 'componentB', 
          actions: assign({ componentAComplete: () => true })
        }
      }
    },
    componentB: {
      entry: [
        assign({
          componentB: () => dialogActorB
        }),
        ({ context }: { context: TourContext }) => {
          if (context.componentB) {
            context.componentB.send({ type: 'OPEN' });
          }
        }
      ],
      invoke: {
        id: 'dialogBSubscription',
        src: fromCallback(({ sendBack }) => {
          let previousState = dialogActorB.getSnapshot();
          const subscription = dialogActorB.subscribe((state) => {
            if (previousState.matches('complete') && state.matches('closed')) {
              sendBack({ type: 'COMPLETE_B' });
            }
            previousState = state;
          });
          return subscription.unsubscribe;
        })
      },
      on: {
        COMPLETE_B: { 
          target: 'idle', 
          actions: assign({ componentBComplete: () => true }) 
        }
      }
    }
  }
}); 