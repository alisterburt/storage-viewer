// src/components/FileItem.tsx
import React from 'react';
import { File } from 'lucide-react';
import { formatSize } from 'shared';
import { FileEntry } from 'shared';

interface FileItemProps {
  file: FileEntry;
}

export function FileItem({ file }: FileItemProps) {
  return (
    <div 
      className="flex items-center justify-between px-4 py-2"
      data-testid={`file-${file.name}`}
    >
      <div className="flex items-center gap-3">
        <File className="h-5 w-5 text-muted-foreground" />
        <span>{file.name}</span>
      </div>
      <span className="text-muted-foreground">{formatSize(file.size)}</span>
    </div>
  );
}