import { createMachine, assign } from 'xstate';
import type { DragState } from './atoms';
import { Rectangle } from '../../packages/geometry/Rectangle';
import { RectangleRenderer } from '../../packages/renderer/RectangleRenderer';
import { getRectangleState } from '../../atoms/rectangleAtoms';
import * as Cesium from 'cesium';

// グローバル参照（単純化のため）
let rendererInstance: RectangleRenderer | null = null;
let rectangleInstance: Rectangle | null = null;
// エンティティインスタンスを保持（後で必要になる可能性があるため）
let entityInstance: Cesium.Entity | null = null;
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
 * Cesium Rectangleを初期化する
 */
function initializeCesiumRectangle(viewer: Cesium.Viewer) {
  if (rendererInstance) {
    // すでに初期化されている場合はクリーンアップ
    cleanupCesiumRectangle();
  }

  try {
    // atomから初期値を取得
    const initialState = getRectangleState();
    console.log('初期状態を取得:', initialState);

    // Rectangleジオメトリを作成
    const rectangle = new Rectangle({
      center: initialState.center,
      width: initialState.width || 1000,
      height: initialState.height || 1000,
      rotation: initialState.rotation || 0
    });
    rectangleInstance = rectangle;

    // レンダラーを作成
    const renderer = new RectangleRenderer(viewer);
    rendererInstance = renderer;

    // デフォルトのレンダリングオプション
    const defaultRenderOptions = {
      color: Cesium.Color.RED.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      height: 500,
      extrudedHeight: 1500
    };

    console.log('四角形を描画');
    // 四角形を描画
    entityInstance = renderer.render(rectangle, defaultRenderOptions);
    
    // エンティティを使用する例（必要に応じて）
    if (entityInstance) {
      console.log(`エンティティID: ${entityInstance.id}`);
    }
  } catch (error) {
    console.error('Rectangleセットアップエラー:', error);
    cleanupCesiumRectangle();
  }
}

/**
 * Cesium Rectangleをクリーンアップする
 */
function cleanupCesiumRectangle() {
  if (cleanupListenersFunction) {
    cleanupListenersFunction();
    cleanupListenersFunction = null;
  }

  if (rendererInstance) {
    rendererInstance.clear();
    rendererInstance = null;
  }

  entityInstance = null;
  rectangleInstance = null;
}

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
              
              // viewerが設定されていれば、Rectangleを初期化
              if (context.viewer && !rendererInstance) {
                initializeCesiumRectangle(context.viewer);
              }

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
        INITIALIZE_VIEWER: {
          actions: assign({
            viewer: ({ event }) => event.viewer
          })
        }
      }
    },
    dragging: {
      entry: () => {
        console.log('ドラッグ状態: ON');
        
        // ドラッグ機能を有効化
        if (rendererInstance && rectangleInstance && entityInstance) {
          console.log('ドラッグリスナーを設定');
          cleanupListenersFunction = rendererInstance.makeDraggable(
            // ドラッグ開始時
            () => {
              console.log('ドラッグ開始（Rectangle内部）');
            },
            // ドラッグ中の処理
            () => {
              // 現在の位置を取得し、Rectangleを更新
              const state = getRectangleState();
              console.log('ドラッグ中（Rectangle内部）:', state);
              
              // Rectangleの位置を更新
              if (rectangleInstance && entityInstance && rendererInstance) {
                // Rectangleオブジェクトを更新
                rectangleInstance.center = state.center;
                if (state.width) rectangleInstance.width = state.width;
                if (state.height) rectangleInstance.height = state.height;
                if (state.rotation) rectangleInstance.rotation = state.rotation;
                
                // エンティティを更新
                rendererInstance.updateEntity(entityInstance, rectangleInstance);
              }
            },
            // ドラッグ終了時の処理
            () => {
              console.log('ドラッグ終了（Rectangle内部）');
            }
          );
        }
      },
      exit: () => {
        // ドラッグリスナーをクリーンアップ
        if (cleanupListenersFunction) {
          console.log('ドラッグリスナーをクリーンアップ');
          cleanupListenersFunction();
          cleanupListenersFunction = null;
        }
      },
      on: {
        MOVE: {
          actions: [
            ({ event }) => {
              console.log('移動イベント:', event.position);
              
              // Rectangleの位置を更新
              if (rectangleInstance && entityInstance && rendererInstance) {
                // atomから状態を取得
                const state = getRectangleState();
                
                // Rectangleオブジェクトを更新
                rectangleInstance.center = state.center;
                if (state.width) rectangleInstance.width = state.width;
                if (state.height) rectangleInstance.height = state.height;
                if (state.rotation) rectangleInstance.rotation = state.rotation;
                
                // エンティティを更新
                rendererInstance.updateEntity(entityInstance, rectangleInstance);
              }
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