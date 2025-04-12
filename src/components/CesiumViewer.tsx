import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useSetAtom } from 'jotai';
import { dragSendAtom } from '../features/Drag/atoms';

const CesiumViewer: React.FC = () => {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const sendDragEvent = useSetAtom(dragSendAtom);

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

    // ステートマシンにviewerを初期化するイベントを送信
    sendDragEvent({
      type: 'INITIALIZE_VIEWER',
      viewer: cesiumViewer
    });

    return () => {
      if (cesiumViewer) {
        cesiumViewer.destroy();
      }
    };
  }, [sendDragEvent]);

  return <div id="cesiumContainer" style={{ width: '100%', height: '100%' }} />;
};

export default CesiumViewer; 