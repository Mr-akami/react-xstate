import { atom } from 'jotai';
import { createStore } from 'jotai/vanilla';
import * as Cesium from 'cesium';
import { Rectangle } from '../packages/geometry/Rectangle';
import { RectangleRenderer } from '../packages/renderer/RectangleRenderer';
import { getCurrentViewer, waitForViewer } from './viewerAtoms';

export interface RectangleState {
  center: Cesium.Cartesian3;
  isDragging: boolean;
  width?: number;
  height?: number;
  rotation?: number;
}

// グローバルなストアを作成
export const store = createStore();

// Rectangleの初期状態
const initialCenter = Cesium.Cartesian3.fromDegrees(139.7670, 35.6814, 500);

// Rectangleの状態を管理するatom
export const rectangleStateAtom = atom<RectangleState>({
  center: initialCenter,
  isDragging: false,
  width: 1000,
  height: 1000,
  rotation: 0
});
export const getRectangleState = atom((get) => get(rectangleStateAtom));
export const setRectangleState = atom(null, (get, set, update: Partial<RectangleState>) => {
  set(rectangleStateAtom, { ...get(rectangleStateAtom), ...update });
});
export const rectangleEntityAtom = atom<Cesium.Entity | null>(null);
export const toggleRectangleAtom = atom(
  // ゲッター - エンティティの有無を返す
  (get) => get(rectangleEntityAtom) !== null,
  // セッター - Rectangleの作成・削除を行う
  (get, set) => {
    const currentEntity = get(rectangleEntityAtom);
    
    console.log('toggleRectangleAtom が呼び出されました:', { 
      現在のエンティティ: !!currentEntity
    });
    
    // 現在のエンティティがある場合は削除
    if (currentEntity) {
      console.log('Rectangleを削除します');
      cleanupRectangle(currentEntity);
      set(rectangleEntityAtom, null);
      set(rectangleStateAtom, { ...get(rectangleStateAtom), isDragging: false });
    } 
    // エンティティがない場合は作成（Viewerが初期化されるのを待つ）
    else {
      const viewer = getCurrentViewer();
      if (viewer) {
        // Viewerが既に初期化されている場合は直接作成
        console.log('Rectangleを作成します（Viewerが既に初期化済み）');
        const state = get(rectangleStateAtom);
        const entity = createRectangle(viewer, state);
        set(rectangleEntityAtom, entity);
      } else {
        // Viewerの初期化を待ってから作成
        console.log('Viewerの初期化を待ちます...');
        waitForViewer((viewer) => {
          console.log('Viewerが初期化されました。Rectangleを作成します');
          const state = get(rectangleStateAtom);
          const entity = createRectangle(viewer, state);
          set(rectangleEntityAtom, entity);
        });
      }
    }
  }
);

const createRectangle = (viewer: Cesium.Viewer, state: RectangleState) => {
  const { center, width, height, rotation } = state;
  const rectangle = new Rectangle({
    center,
    width: width || 1000,
    height: height || 1000,
    rotation: rotation || 0
  });
  const renderer = new RectangleRenderer(viewer);
      const defaultRenderOptions = {
      color: Cesium.Color.RED.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      height: 500,
      extrudedHeight: 1500
    };
  const entity = renderer.render(rectangle, defaultRenderOptions);
  return entity;
};

const cleanupRectangle = (entity: Cesium.Entity) => {
  if (entity) {
    const viewer = getCurrentViewer();
    if (viewer) {
      viewer.entities.remove(entity);
    }
  }
};
