import { atom } from 'jotai';
import * as Cesium from 'cesium';
import { createStore } from 'jotai/vanilla';

// グローバルストア
export const viewerStore = createStore();

// Cesium Viewerを管理するアトム
export const cesiumViewerAtom = atom<Cesium.Viewer | null>(null);

// Viewerの初期化状態を監視するアトム
export const viewerInitializedAtom = atom(
  (get) => get(cesiumViewerAtom) !== null
);

// Viewerのロード完了を待つ関数
export const waitForViewer = (callback: (viewer: Cesium.Viewer) => void) => {
  const checkInterval = setInterval(() => {
    const viewer = viewerStore.get(cesiumViewerAtom);
    if (viewer) {
      clearInterval(checkInterval);
      callback(viewer);
    }
  }, 100);
  
  // 20秒後にタイムアウト
  setTimeout(() => {
    clearInterval(checkInterval);
    console.error('Viewerの初期化がタイムアウトしました');
  }, 20000);
};

// 現在のViewerを取得する
export const getCurrentViewer = () => {
  return viewerStore.get(cesiumViewerAtom);
}; 