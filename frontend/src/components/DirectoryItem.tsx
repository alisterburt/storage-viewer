// src/components/DirectoryItem.tsx
import React from 'react';
import { Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DirectoryEntry, formatSize} from 'shared';

interface DirectoryItemProps {
  directory: DirectoryEntry;
  onClick: (directory: DirectoryEntry) => void;
  isSelected?: boolean;
}

export function DirectoryItem({ directory, onClick, isSelected = false }: DirectoryItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-accent rounded-md",
        isSelected && "bg-accent"
      )}
      onClick={() => onClick(directory)}
      data-testid={`directory-${directory.name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(directory);
        }
      }}
    >
      <div className="flex items-center gap-3">
        <Folder className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{directory.name}</span>
      </div>
      <span className="text-muted-foreground">{formatSize(directory.size)}</span>
    </div>
  );
}