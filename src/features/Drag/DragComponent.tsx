import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { dragStateAtom, debugDragStateAtom, dragMachineAtom, dragSendAtom } from './atoms';

const DragComponent: React.FC = () => {
  // ドラッグ状態のatom
  const [dragState, setDragState] = useAtom(dragStateAtom);
  // デバッグ情報
  const debugState = useAtomValue(debugDragStateAtom);
  // マシン状態
  const machineState = useAtomValue(dragMachineAtom);
  // イベント送信用関数
  const sendEvent = useSetAtom(dragSendAtom);

  // マシンが最終状態になったときの処理

  const handleDragStart = () => {
    console.log('ドラッグ開始ボタン押下');
    setDragState({
      ...dragState,
      isDragging: true
    });
  };

  const handleDragStop = () => {
    console.log('ドラッグ停止ボタン押下');
    setDragState({
      ...dragState,
      isDragging: false
    });
  };

  const handleRandomPosition = () => {
    const randomX = Math.floor(Math.random() * 300);
    const randomY = Math.floor(Math.random() * 300);
    console.log(`位置更新: (${randomX}, ${randomY})`);
    
    setDragState({
      ...dragState,
      position: { x: randomX, y: randomY }
    });
  };

  // マシンに直接イベントを送信するテスト
  const handleDirectEvent = () => {
    console.log('マシンにMOVEイベントを直接送信');
    sendEvent({
      type: 'MOVE',
      position: { x: 150, y: 150 }
    });
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h3>ドラッグコンポーネント (jotai-xstate版)</h3>
      <p>ドラッグ状態: {dragState.isDragging ? 'ドラッグ中' : '停止中'}</p>
      <p>マシン状態: {String(machineState.value)}</p>
      <p>位置: X={Math.round(dragState.position.x)}, Y={Math.round(dragState.position.y)}</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          style={{ 
            padding: '8px 16px',
            backgroundColor: dragState.isDragging ? '#ff5722' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={dragState.isDragging ? handleDragStop : handleDragStart}
        >
          {dragState.isDragging ? 'ドラッグ停止' : 'ドラッグ開始'}
        </button>
        
        {dragState.isDragging && (
          <button
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={handleRandomPosition}
          >
            ランダム位置
          </button>
        )}
        
        <button
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={handleDirectEvent}
        >
          直接イベント
        </button>
      </div>

      <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
        <details>
          <summary>デバッグ情報</summary>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(debugState, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default DragComponent; 