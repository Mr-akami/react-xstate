import { createMachine, assign, createActor } from 'xstate';


export const dialogMachineA = createMachine({
  id: 'dialogA',
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
            count: () => 0,
            total: () => 0
          } as const)
        }
      }
    },
    open: {
      on: {
        SELECT: [
          {
            target: 'complete',
            guard: ({ context }) => context.count >= 2,
            actions: assign({
              count: ({ context }) => context.count + 1,
              total: ({ context, event }) => context.total + event.value
            } as const)
          },
          {
            target: 'open',
            actions: assign({
              count: ({ context }) => context.count + 1,
              total: ({ context, event }) => context.total + event.value
            } as const)
          }
        ]
      }
    },
    complete: {
      on: {
        RESET: {
          target: 'closed',
          actions: assign({
            count: () => 0,
            total: () => 0
          } as const)
        }
      }
    }
  }
});

export const dialogActorA = createActor(dialogMachineA).start();