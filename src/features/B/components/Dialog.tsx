import React from 'react';

interface DialogProps {
  isOpen: boolean;
  isComplete: boolean;
  onSelect: (value: number) => void;
  onSave: () => void;
  title: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  isComplete,
  onSelect,
  onSave,
  title,
}) => {
  if (!isOpen && !isComplete) return null;

  const dialogStyle = {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '20px',
    border: '1px solid black',
  };

  if (isComplete) {
    return (
      <div style={dialogStyle}>
        <h3>Complete!</h3>
        <button onClick={onSave}>Save</button>
      </div>
    );
  }

  return (
    <div style={dialogStyle}>
      <h3>{title}</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => onSelect(0)}>0</button>
        <button onClick={() => onSelect(1)}>1</button>
      </div>
    </div>
  );
}; 