import { atom } from 'jotai';
import { createStore } from 'jotai/vanilla';
import * as Cesium from 'cesium';

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

// ストアを使用した操作関数
export const getRectangleState = () => store.get(rectangleStateAtom);
export const setRectangleState = (state: Partial<RectangleState>) => {
  const currentState = getRectangleState();
  store.set(rectangleStateAtom, { ...currentState, ...state });
};
export const subscribeToRectangle = (callback: () => void) => {
  return store.sub(rectangleStateAtom, callback);
}; 