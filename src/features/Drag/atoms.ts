import { atom } from 'jotai';
import { atomWithMachine } from 'jotai-xstate';
import { createDragMachine } from './machine';

export interface DragState {
  isDragging: boolean;
  position: {
    x: number;
    y: number;
  };
}

// 初期のドラッグ状態
const initialDragState: DragState = {
  isDragging: false,
  position: { x: 0, y: 0 }
};

// 素のドラッグ状態を管理するプライマリatom
export const dragPrimitiveAtom = atom<DragState>(initialDragState);

// dragPrimitiveAtomの値を使用してマシンを初期化するatomWithMachine
export const dragMachineAtom = atomWithMachine((get) => {
  console.log('マシン初期化（atomWithMachine）');
  return createDragMachine(get(dragPrimitiveAtom));
});

// send機能用のアトム
export const dragSendAtom = atom(null, (get, set, event: any) => {
  set(dragMachineAtom, event);
});

// 外部向け：dragMachineAtomの状態から派生したatom
export const dragStateAtom = atom(
  // getter - マシンの状態からDragState形式に変換
  (get) => {
    const machineState = get(dragMachineAtom);
    const isDragging = machineState.value === 'dragging';
    const position = machineState.context.position;
    
    return {
      isDragging,
      position
    };
  },
  
  // setter - isDraggingの変更に応じてマシンにイベントを送信
  (get, set, newState: DragState) => {
    const currentState = get(dragStateAtom);
    
    console.log('dragStateAtom setter:', { 
      現在の状態: currentState, 
      新しい状態: newState 
    });
    
    // まず素の状態を更新（いつでも）
    set(dragPrimitiveAtom, newState);
    
    // isDraggingの変化に応じたイベント送信
    if (!currentState.isDragging && newState.isDragging) {
      // false → true: START_DRAGイベント送信
      console.log('ドラッグ開始イベント送信');
      set(dragSendAtom, {
        type: 'START_DRAG',
        position: { ...newState.position },
        elementPosition: { ...newState.position }
      });
    }
    else if (currentState.isDragging && !newState.isDragging) {
      // true → false: END_DRAGイベント送信
      console.log('ドラッグ終了イベント送信');
      set(dragSendAtom, { type: 'END_DRAG' });
    }
    // 位置のみの変更: MOVEイベント送信
    else if (newState.isDragging && 
            (currentState.position.x !== newState.position.x || 
             currentState.position.y !== newState.position.y)) {
      console.log('位置更新イベント送信:', newState.position);
      set(dragSendAtom, { 
        type: 'MOVE', 
        position: { ...newState.position }
      });
    }
  }
);

// デバッグ用：素のatomの値と現在のマシン状態を出力するatom
export const debugDragStateAtom = atom((get) => {
  const primitiveState = get(dragPrimitiveAtom);
  const machineState = get(dragMachineAtom);
  
  return {
    primitive: primitiveState,
    machine: {
      state: machineState.value,
      context: machineState.context
    }
  };
}); 