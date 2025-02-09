import { createMachine, assign } from 'xstate';

interface DialogContext {
  count: number;
  total: number;
}

type DialogEvent = 
  | { type: 'OPEN' }
  | { type: 'SELECT'; value: number }
  | { type: 'RESET' };

export const dialogMachineB = createMachine({
  id: 'dialogB',
  initial: 'closed',
  context: {
    count: 0,
    total: 0
  },
  states: {
    closed: {
      on: {
        OPEN: {
          target: 'open',
          actions: assign({
            count: (_: DialogContext) => 0,
            total: (_: DialogContext) => 0
          })
        }
      }
    },
    open: {
      on: {
        SELECT: [{
          target: 'complete',
          guard: (context) => context.count >= 2,
          actions: assign({
            count: (context: DialogContext) => context.count + 1,
            total: (context: DialogContext, event: { value: number }) => context.total + event.value
          })
        }, {
          target: 'open',
          actions: assign({
            count: (context: DialogContext) => context.count + 1,
            total: (context: DialogContext, event: { value: number }) => context.total + event.value
          })
        }]
      }
    },
    complete: {
      on: {
        RESET: {
          target: 'closed',
          actions: assign({
            count: (_: DialogContext) => 0,
            total: (_: DialogContext) => 0
          })
        }
      }
    }
  }
} satisfies import('xstate').StateMachine<DialogContext, any, DialogEvent>);
