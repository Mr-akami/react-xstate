import { createMachine, assign } from 'xstate';
import type { DragState } from './atoms';
import * as Cesium from 'cesium';
import { getCurrentViewer } from '../../atoms/viewerAtoms';
import { rectangleRendererAtom } from '../../atoms/rectangleAtoms';
import { store } from '../../atoms/rectangleAtoms';

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
  | { type: 'END_DRAG' };

/**
 * Rectangleのドラッグハンドラーを設定する
 */
function setupRectangleDragHandler(): (() => void) | undefined {
  const viewer = getCurrentViewer();
  if (!viewer) {
    console.warn('Viewerが初期化されていないため、Rectangleドラッグハンドラーを設定できません');
    return;
  }

  // レンダラーを取得する前にstoreの内容を確認
  console.log('store内のrendererを確認:', 
    store.get(rectangleRendererAtom) ? 'renderer存在' : 'renderer未存在', 
    store.get(rectangleRendererAtom)
  );
  
  const renderer = store.get(rectangleRendererAtom);
  if (!renderer) {
    console.warn('RectangleRendererが初期化されていないため、Rectangleドラッグハンドラーを設定できません');
    return;
  }

  console.log('ドラッグハンドラーを設定します', renderer);
  const dragHandler = renderer.makeDraggable(
    () => console.log('ドラッグハンドラー: ドラッグ開始'),
    (pos) => console.log('ドラッグハンドラー: ドラッグ中', pos),
    () => console.log('ドラッグハンドラー: ドラッグ終了')
  );
  return dragHandler;
}


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
    viewer: null,
    handler: () => {}
  },
  states: {
    idle: {
      entry: () => {
        console.log('ドラッグ状態: OFF');
        // ドラッグ終了時にRectangleのドラッグハンドラーがまだ残っている場合は解除
      },
      on: {
        START_DRAG: {
          target: 'dragging',
          actions: [
            ({ event, context }) => {
              console.log('ドラッグ開始イベント受信:', event);
              
              // Rectangleのドラッグハンドラーを設定
              const handler = setupRectangleDragHandler();
              if (handler) {
                context.handler = handler;
              }
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
        
        // ドラッグ機能を有効化 (既にSTART_DRAGで設定済み)
      },
      exit: ({ context }) => {
        // ドラッグリスナーをクリーンアップ
        context.handler();  
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