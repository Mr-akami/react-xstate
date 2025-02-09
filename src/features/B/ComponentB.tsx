import React from 'react';
import { useDialogB } from './useDialogB';
import { Dialog } from './Dialog';

const ComponentB: React.FC = () => {
   const { isOpen, isComplete, handleSelect, handleSave, openDialog, total, count, currentTotal } = useDialogB();

  return (
    <div>
      <button onClick={openDialog}>Component B (Total: {total})</button>
      <Dialog
        isOpen={isOpen}
        isComplete={isComplete}
        onSelect={handleSelect}
        onSave={handleSave}
        title="Dialog B"
        count={count}
        total={currentTotal}
      />
    </div>
  );
};

export default ComponentB; 