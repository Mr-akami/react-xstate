import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { Rectangle } from '../packages/geometry/Rectangle';
import { RectangleRenderer } from '../packages/renderer/RectangleRenderer';
import { getRectangleState, subscribeToRectangle } from '../atoms/rectangleAtoms';

interface UseCesiumRectangleOptions {
  rectangleOptions?: {
    color?: Cesium.Color;
    outline?: boolean;
    outlineColor?: Cesium.Color;
    outlineWidth?: number;
    height?: number;
    extrudedHeight?: number;
  };
  onDragStart?: () => void;
  onDrag?: () => void;
  onDragEnd?: () => void;
}

export const useCesiumRectangle = (viewer: Cesium.Viewer | null, options: UseCesiumRectangleOptions = {}) => {
  const rectangleRef = useRef<Rectangle | null>(null);
  const rendererRef = useRef<RectangleRenderer | null>(null);
  const entityRef = useRef<Cesium.Entity | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // クリーンアップ関数
  const cleanup = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    
    if (rendererRef.current) {
      rendererRef.current.clear();
      rendererRef.current = null;
    }
    
    entityRef.current = null;
    rectangleRef.current = null;
  };

  // rectangleのセットアップ
  useEffect(() => {
    // viewerがなければ何もしない
    if (!viewer) {
      cleanup();
      return;
    }

    console.log('Rectangleセットアップ開始');

    // まずクリーンアップ
    cleanup();

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
      rectangleRef.current = rectangle;

      // レンダラーを作成
      const renderer = new RectangleRenderer(viewer);
      rendererRef.current = renderer;

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
      const entity = renderer.render(rectangle, {
        ...defaultRenderOptions,
        ...options.rectangleOptions
      });
      entityRef.current = entity;

      // atomの変更を購読して四角形を更新
      const unsubscribe = subscribeToRectangle(() => {
        const state = getRectangleState();
        console.log('atomの更新:', state);

        if (rectangleRef.current && entityRef.current && rendererRef.current) {
          // Rectangleオブジェクトを更新
          rectangleRef.current.center = state.center;
          if (state.width) rectangleRef.current.width = state.width;
          if (state.height) rectangleRef.current.height = state.height;
          if (state.rotation) rectangleRef.current.rotation = state.rotation;
          
          // エンティティを更新
          rendererRef.current.updateEntity(entityRef.current, rectangleRef.current);
        }
      });
      unsubscribeRef.current = unsubscribe;

      console.log('ドラッグ機能を追加');
      // ドラッグ機能を追加
      const dragCleanup = renderer.makeDraggable(
        // ドラッグ開始時
        () => {
          console.log('ドラッグ開始:', getRectangleState());
          if (options.onDragStart) options.onDragStart();
        },
        // ドラッグ中
        () => {
          console.log('ドラッグ中:', getRectangleState());
          if (options.onDrag) options.onDrag();
        },
        // ドラッグ終了時
        () => {
          console.log('ドラッグ終了:', getRectangleState());
          if (options.onDragEnd) options.onDragEnd();
        }
      );
      cleanupRef.current = dragCleanup;

      console.log('Rectangleセットアップ完了');
    } catch (error) {
      console.error('Rectangleセットアップエラー:', error);
      cleanup();
    }

    return cleanup;
  }, [viewer, options]);

  return {
    rectangle: rectangleRef.current,
    entity: entityRef.current,
    renderer: rendererRef.current
  };
}; 