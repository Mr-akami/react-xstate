import React from 'react';
import { useDialogA } from './useDialogA';
import { Dialog } from './Dialog';

const ComponentA: React.FC = () => {
  const { isOpen, isComplete, handleSelect, handleSave, openDialog, total, count, currentTotal } = useDialogA();

  return (
    <div>
      <button onClick={openDialog}>Component A (Total: {total})</button>
      <Dialog
        isOpen={isOpen}
        isComplete={isComplete}
        onSelect={handleSelect}
        onSave={handleSave}
        title="Dialog A"
        count={count}
        total={currentTotal}
      />
    </div>
  );
};

export default ComponentA; 