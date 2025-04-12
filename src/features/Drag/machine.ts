import { createMachine, assign } from 'xstate';
import type { DragState } from './atoms';
import * as Cesium from 'cesium';

let cleanupListenersFunction: (() => void) | null = null;

// ドラッグマシンのコンテキスト型
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
  viewer?: Cesium.Viewer | null;
}

// ドラッグマシンのイベント型
export type DragEvents = 
  | { type: 'START_DRAG'; position: { x: number; y: number }; elementPosition: { x: number; y: number } }
  | { type: 'MOVE'; position: { x: number; y: number } }
  | { type: 'END_DRAG' }
  | { type: 'INITIALIZE_VIEWER'; viewer: Cesium.Viewer };


/**
 * Cesium Rectangleをクリーンアップする
 */
// function cleanupCesiumRectangle() {
//   if (cleanupListenersFunction) {
//     cleanupListenersFunction();
//     cleanupListenersFunction = null;
//   }

//   if (rendererInstance) {
//     rendererInstance.clear();
//     rendererInstance = null;
//   }

//   entityInstance = null;
//   rectangleInstance = null;
// }

/**
 * ドラッグ操作のステートマシンを作成する関数
 * @param initialState 初期状態
 * @returns XStateマシン
 */
export const createDragMachine = (initialState: DragState) => createMachine({
  id: 'drag',
  initial: 'idle',
  context: {
    position: initialState.position,
    startPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    viewer: null
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
            ({ event, context }) => {
              console.log('ドラッグ開始イベント受信:', event);
              

              // ここではドラッグリスナーは設定しない
              // リスナーはRectangleRendererの中ですでに設定されているため
            },
            assign({
              position: ({ event }) => {
                return event.elementPosition;
              },
              startPosition: ({ event }) => {
                return event.position;
              },
              offset: ({ event }) => {
                return {
                  x: event.position.x - event.elementPosition.x,
                  y: event.position.y - event.elementPosition.y
                };
              }
            })
          ]
        },
      }
    },
    dragging: {
      entry: () => {
        console.log('ドラッグ状態: ON');
        
        // ドラッグ機能を有効化
       
      },
      exit: () => {
        // ドラッグリスナーをクリーンアップ
        // if (cleanupListenersFunction) {
        //   console.log('ドラッグリスナーをクリーンアップ');
        //   cleanupListenersFunction();
        //   cleanupListenersFunction = null;
        // }
      },
      on: {
        MOVE: {
          actions: [
            ({ event }) => {
              console.log('移動イベント:', event.position);
              
            },
            assign({
              position: ({ context, event }) => {
                return {
                  x: event.position.x - context.offset.x,
                  y: event.position.y - context.offset.y
                };
              }
            })
          ]
        },
        END_DRAG: {
          target: 'idle'
        }
      }
    }
  }
}); 