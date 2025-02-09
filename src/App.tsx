import React from 'react';
import ComponentA from './features/A/ComponentA';
import ComponentB from './features/B/ComponentB';
import TourComponent from './features/Tour/TourComponent';
import './App.css';

function App() {
  return (
    <div className="App">
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', padding: '20px' }}>
        <ComponentA />
        <ComponentB />
        <TourComponent />
      </div>
    </div>
  );
}

export default App;
