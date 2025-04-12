import * as Cesium from 'cesium';

interface RectangleOptions {
  center: Cesium.Cartesian3;
  width: number;
  height: number;
  rotation?: number;
}

export class Rectangle {
  center: Cesium.Cartesian3;
  width: number;
  height: number;
  rotation: number;

  constructor(options: RectangleOptions) {
    this.center = options.center;
    this.width = options.width;
    this.height = options.height;
    this.rotation = options.rotation || 0;
  }

  // 四角形の頂点を計算
  getCorners(): Cesium.Cartesian3[] {
    const cartographic = Cesium.Cartographic.fromCartesian(this.center);
    const longitude = cartographic.longitude;
    const latitude = cartographic.latitude;
    const height = cartographic.height;

    // メートル単位の幅と高さを緯度経度に変換
    const metersPerDegree = 111319.9; // 赤道での1度あたりのメートル数
    const widthDegrees = this.width / (metersPerDegree * Math.cos(latitude));
    const heightDegrees = this.height / metersPerDegree;

    // 四角形の半分の幅と高さ
    const halfWidthDegrees = widthDegrees / 2;
    const halfHeightDegrees = heightDegrees / 2;

    // 回転前の四角形の頂点（時計回り）
    const corners = [
      Cesium.Cartesian3.fromRadians(
        longitude - halfWidthDegrees, 
        latitude - halfHeightDegrees, 
        height
      ),
      Cesium.Cartesian3.fromRadians(
        longitude + halfWidthDegrees, 
        latitude - halfHeightDegrees, 
        height
      ),
      Cesium.Cartesian3.fromRadians(
        longitude + halfWidthDegrees, 
        latitude + halfHeightDegrees, 
        height
      ),
      Cesium.Cartesian3.fromRadians(
        longitude - halfWidthDegrees, 
        latitude + halfHeightDegrees, 
        height
      )
    ];

    // 回転が指定されている場合は頂点を回転
    if (this.rotation !== 0) {
      const rotationMatrix = Cesium.Matrix3.fromRotationZ(this.rotation);
      const centerHigh = new Cesium.Cartesian3();
      const centerLow = new Cesium.Cartesian3();
      Cesium.Cartesian3.clone(this.center, centerHigh);
      Cesium.Cartesian3.clone(this.center, centerLow);

      for (let i = 0; i < corners.length; i++) {
        // 中心点を原点とした相対座標に変換
        const relative = Cesium.Cartesian3.subtract(
          corners[i], 
          this.center, 
          new Cesium.Cartesian3()
        );
        
        // 回転を適用
        const rotated = Cesium.Matrix3.multiplyByVector(
          rotationMatrix, 
          relative, 
          new Cesium.Cartesian3()
        );
        
        // 中心点を加えて元の座標系に戻す
        corners[i] = Cesium.Cartesian3.add(
          rotated, 
          this.center, 
          new Cesium.Cartesian3()
        );
      }
    }

    return corners;
  }

  // 四角形のCesium.Rectangleを取得
  getRectangle(): Cesium.Rectangle {
    const cartographic = Cesium.Cartographic.fromCartesian(this.center);
    const longitude = cartographic.longitude;
    const latitude = cartographic.latitude;

    // メートル単位の幅と高さを緯度経度に変換
    const metersPerDegree = 111319.9; // 赤道での1度あたりのメートル数
    const widthDegrees = this.width / (metersPerDegree * Math.cos(latitude));
    const heightDegrees = this.height / metersPerDegree;

    // 四角形の半分の幅と高さ
    const halfWidthDegrees = widthDegrees / 2;
    const halfHeightDegrees = heightDegrees / 2;

    return Cesium.Rectangle.fromRadians(
      longitude - halfWidthDegrees,
      latitude - halfHeightDegrees,
      longitude + halfWidthDegrees,
      latitude + halfHeightDegrees
    );
  }
} 