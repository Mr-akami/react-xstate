import { createMachine, assign, AnyActorRef } from 'xstate';
import { dialogActor } from '../A/useDialogA';
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
      entry: [
        assign({
          componentA: () => dialogActor
        }),
        ({ self }) => {
          dialogActor.subscribe((state) => {
            if (state.matches('complete')) {
              self.send({ type: 'COMPLETE_A' });
            }
          });
        }
      ],
      on: {
        COMPLETE_A: { 
          target: 'componentB', 
          actions: assign({ componentAComplete: true })
        }
      }
    },
    componentB: {
      entry: [
        assign({
          componentB: () => dialogActorB
        }),
        ({ self }) => {
          dialogActorB.subscribe((state) => {
            if (state.matches('complete')) {
              self.send({ type: 'COMPLETE_B' });
            }
          });
        }
      ],
      on: {
        COMPLETE_B: { 
          target: 'idle', 
          actions: assign({ componentBComplete: true }) 
        }
      }
    }
  }
}); 