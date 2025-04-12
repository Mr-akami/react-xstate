import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const CesiumViewer: React.FC = () => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewer = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    let mounted = true;

    const initViewer = async () => {
      if (cesiumContainer.current && !viewer.current) {
        const terrainProvider = await Cesium.createWorldTerrainAsync();
        
        if (!mounted) return;

        viewer.current = new Cesium.Viewer(cesiumContainer.current, {
          terrainProvider,
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
        });
      }
    };

    initViewer().catch(console.error);

    return () => {
      mounted = false;
      if (viewer.current) {
        viewer.current.destroy();
        viewer.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={cesiumContainer} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }} 
    />
  );
};

export default CesiumViewer; 