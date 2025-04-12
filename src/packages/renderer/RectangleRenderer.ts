import * as Cesium from 'cesium';
import { Rectangle } from '../geometry/Rectangle';
import {  store, rectangleStateAtom } from '../../atoms/rectangleAtoms';

export interface RectangleRenderOptions {
  color?: Cesium.Color;
  outline?: boolean;
  outlineColor?: Cesium.Color;
  outlineWidth?: number;
  height?: number;
  extrudedHeight?: number;
}

export class RectangleRenderer {
  private viewer: Cesium.Viewer;
  private entities: Cesium.Entity[] = [];

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  render(rectangle: Rectangle, options: RectangleRenderOptions = {}): Cesium.Entity {
    // デフォルトオプション
    const defaultOptions: Required<RectangleRenderOptions> = {
      color: Cesium.Color.RED.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      height: 0,
      extrudedHeight: 0
    };

    // オプションをマージ
    const renderOptions = { ...defaultOptions, ...options };

    // 四角形のエンティティを作成
    const entity = this.viewer.entities.add({
      rectangle: {
        coordinates: rectangle.getRectangle(),
        material: renderOptions.color,
        outline: renderOptions.outline,
        outlineColor: renderOptions.outlineColor,
        outlineWidth: renderOptions.outlineWidth,
        height: renderOptions.height,
        extrudedHeight: renderOptions.extrudedHeight > 0 ? 
          renderOptions.extrudedHeight : undefined,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
      }
    });

    this.entities.push(entity);
    return entity;
  }

  // 四角形をドラッグ可能にする
  makeDraggable(
    onDragStart?: () => void,
    onDrag?: (position: Cesium.Cartesian3) => void,
    onDragEnd?: () => void
  ): () => void {
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    let dragging = false;
    let lastPosition: Cesium.Cartesian3 | undefined;
    
    // 最後にレンダリングしたエンティティを取得
    const entity = this.entities[this.entities.length - 1];

    handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedObject = this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject) && pickedObject.id === entity) {
        dragging = true;
        this.viewer.scene.screenSpaceCameraController.enableRotate = false;
        
        // ドラッグ状態をatomに設定
        const currentState = store.get(rectangleStateAtom);
        store.set(rectangleStateAtom, {...currentState, isDragging: true});
        
        if (onDragStart) onDragStart();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      if (dragging) {
        const currentPosition = this.viewer.scene.camera.pickEllipsoid(
          event.endPosition,
          this.viewer.scene.globe.ellipsoid
        );

        if (currentPosition && lastPosition) {
          const offset = Cesium.Cartesian3.subtract(
            currentPosition,
            lastPosition,
            new Cesium.Cartesian3()
          );

          // atomから現在の状態を取得
          const currentState = store.get(rectangleStateAtom);
          
          // 現在の中心位置に移動量を加算
          const newCenter = Cesium.Cartesian3.add(
            currentState.center,
            offset,
            new Cesium.Cartesian3()
          );
          
          // atomを経由して位置を更新
          store.set(rectangleStateAtom, {
            ...currentState,
            center: newCenter
          });

          if (onDrag) onDrag(currentPosition);
        }

        lastPosition = currentPosition;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(() => {
      dragging = false;
      lastPosition = undefined;
      this.viewer.scene.screenSpaceCameraController.enableRotate = true;
      
      // ドラッグ状態をatomに設定
      const endState = store.get(rectangleStateAtom);
      store.set(rectangleStateAtom, {...endState, isDragging: false});
      
      if (onDragEnd) onDragEnd();
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    // クリーンアップ関数を返す
    return () => {
      handler.destroy();
    };
  }

  // エンティティを更新
  updateEntity(entity: Cesium.Entity, rectangle: Rectangle): void {
    if (entity.rectangle) {
      entity.rectangle.coordinates = new Cesium.ConstantProperty(
        rectangle.getRectangle()
      );
    }
  }

  // すべてのエンティティを削除
  clear(): void {
    this.entities.forEach(entity => {
      this.viewer.entities.remove(entity);
    });
    this.entities = [];
  }
} 