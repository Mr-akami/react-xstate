import React from 'react';
import ComponentA from './features/A/ComponentA';
import ComponentB from './features/B/ComponentB';
import TourComponent from './features/Tour/TourComponent';
import CesiumViewer from './components/CesiumViewer';
import './App.css';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh'
    }}>
      <div style={{ 
        flex: 1, 
        padding: '20px',
        borderRight: '1px solid #ccc',
        overflow: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          flexDirection: 'column'
        }}>
          <ComponentA />
          <ComponentB />
          <TourComponent />
        </div>
      </div>
      <div style={{ 
        flex: 1,
        position: 'relative'
      }}>
        <CesiumViewer />
      </div>
    </div>
  );
}

export default App;
