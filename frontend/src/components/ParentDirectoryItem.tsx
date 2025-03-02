// src/components/ParentDirectoryItem.tsx
import React from 'react';
import { FolderUp } from 'lucide-react';

interface ParentDirectoryItemProps {
  onClick: () => void;
}

export function ParentDirectoryItem({ onClick }: ParentDirectoryItemProps) {
  return (
    <div 
      className="flex items-center px-4 py-2 cursor-pointer hover:bg-accent rounded-md"
      onClick={onClick}
      data-testid="parent-directory"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Backspace') {
          onClick();
        }
      }}
    >
      <div className="flex items-center gap-3">
        <FolderUp className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">..</span>
      </div>
    </div>
  );
}
