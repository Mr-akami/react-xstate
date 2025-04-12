import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useCesiumRectangle } from '../hooks/useCesiumRectangle';

const CesiumViewer: React.FC = () => {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);

  // Cesium Viewerのセットアップ
  useEffect(() => {
    // Viewerの初期化
    const cesiumViewer = new Cesium.Viewer('cesiumContainer', {
      baseLayerPicker: false,
      timeline: false,
      animation: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false
    });

    // 地球を表示するための設定
    cesiumViewer.scene.globe.enableLighting = false;
    cesiumViewer.scene.globe.showGroundAtmosphere = true;

    // カメラを東京付近に移動
    cesiumViewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(139.7670, 35.6814, 10000)
    });

    viewerRef.current = cesiumViewer;
    setViewer(cesiumViewer);

    return () => {
      if (cesiumViewer) {
        cesiumViewer.destroy();
      }
    };
  }, []);

  // Rectangleのセットアップと管理
  useCesiumRectangle(viewer, {
    rectangleOptions: {
      color: Cesium.Color.RED.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      height: 500,
      extrudedHeight: 1500
    },
    onDragStart: () => {
      console.log('ドラッグ開始イベントをコンポーネントで処理');
    },
    onDrag: () => {
      console.log('ドラッグ中イベントをコンポーネントで処理');
    },
    onDragEnd: () => {
      console.log('ドラッグ終了イベントをコンポーネントで処理');
    }
  });

  return <div id="cesiumContainer" style={{ width: '100%', height: '100%' }} />;
};

export default CesiumViewer; 