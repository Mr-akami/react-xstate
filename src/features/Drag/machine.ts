import { createMachine, assign } from 'xstate';
import type { DragState } from './atoms';

export interface DragContext {
  position: {
    x: number;
    y: number;
  };
  startPosition: {
    x: number;
    y: number;
  };
  offset: {
    x: number;
    y: number;
  };
}

export type DragStartEvent = { type: 'START_DRAG'; position: { x: number; y: number }; elementPosition: { x: number; y: number } };
export type DragMoveEvent = { type: 'MOVE'; position: { x: number; y: number } };
export type DragEndEvent = { type: 'END_DRAG' };

export type DragEvent = DragStartEvent | DragMoveEvent | DragEndEvent;

/**
 * ドラッグ操作のステートマシンを作成する関数
 * @param initialState 初期状態
 * @returns XStateマシン
 */
export const createDragMachine = (initialState: DragState) => {
  return createMachine({
    id: 'drag',
    initial: 'idle',
    context: {
      position: initialState.position,
      startPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 }
    },
    types: {
      context: {} as DragContext,
      events: {} as DragEvent
    },
    states: {
      idle: {
        entry: () => {
          console.log('ドラッグ状態: OFF');
        },
        on: {
          START_DRAG: {
            target: 'dragging',
            actions: [
              ({ event }) => {
                console.log('ドラッグ開始イベント受信:', event);
              },
              assign({
                position: ({ event }) => {
                  return (event as DragStartEvent).elementPosition;
                },
                startPosition: ({ event }) => {
                  return (event as DragStartEvent).position;
                },
                offset: ({ event }) => {
                  const e = event as DragStartEvent;
                  return {
                    x: e.position.x - e.elementPosition.x,
                    y: e.position.y - e.elementPosition.y
                  };
                }
              })
            ]
          }
        }
      },
      dragging: {
        entry: () => {
          console.log('ドラッグ状態: ON');
        },
        on: {
          MOVE: {
            actions: [
              ({ event }) => {
                console.log('移動イベント:', (event as DragMoveEvent).position);
              },
              assign({
                position: ({ context, event }) => {
                  const e = event as DragMoveEvent;
                  return {
                    x: e.position.x - context.offset.x,
                    y: e.position.y - context.offset.y
                  };
                }
              })
            ]
          },
          END_DRAG: {
            target: 'idle',
            actions: () => {
              console.log('ドラッグ終了');
            }
          }
        }
      }
    }
  });
}; 