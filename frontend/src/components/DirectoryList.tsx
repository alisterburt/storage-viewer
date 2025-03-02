// src/components/DirectoryList.tsx
import React, { useEffect, useState } from 'react';
import { FileEntry, DirectoryEntry, DirectoryContents } from 'shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { DirectoryItem } from './DirectoryItem';
import { FileItem } from './FileItem';
import { ParentDirectoryItem } from './ParentDirectoryItem';

interface DirectoryListProps {
  directoryContents: DirectoryContents;
  onNavigateToDirectory: (directory: DirectoryEntry) => void;
  onNavigateToParent: () => void;
}

export function DirectoryList({
  directoryContents,
  onNavigateToDirectory,
  onNavigateToParent
}: DirectoryListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Resets selection when directory changes
  useEffect(() => {
    setSelectedIndex(null);
  }, [directoryContents.path]);

  // Sort directories and files by size (largest first)
  const sortedDirectories = [...directoryContents.directories].sort((a, b) => b.size - a.size);
  const sortedFiles = [...directoryContents.files].sort((a, b) => b.size - a.size);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = sortedDirectories.length + sortedFiles.length;
    const isInRootDirectory = directoryContents.path.length === 0;
    const directoryOffset = isInRootDirectory ? 0 : 1; // Account for ".." entry

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev === null ? 0 : Math.min(prev + 1, totalItems + directoryOffset - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev === null ? totalItems + directoryOffset - 1 : Math.max(prev - 1, 0)
        );
        break;
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setSelectedIndex(totalItems + directoryOffset - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === null) return;
        
        if (!isInRootDirectory && selectedIndex === 0) {
          onNavigateToParent();
        } else {
          const adjustedIndex = isInRootDirectory ? selectedIndex : selectedIndex - 1;
          if (adjustedIndex < sortedDirectories.length) {
            onNavigateToDirectory(sortedDirectories[adjustedIndex]);
          }
        }
        break;
      case 'Backspace':
        if (!isInRootDirectory) {
          e.preventDefault();
          onNavigateToParent();
        }
        break;
    }
  };

  return (
    <Card className="w-full" tabIndex={0} onKeyDown={handleKeyDown}>
      <CardContent className="p-0">
        <div className="divide-y">
          {/* Parent directory navigation (..) */}
          {directoryContents.path.length > 0 && (
            <ParentDirectoryItem onClick={onNavigateToParent} />
          )}

          {/* Directory entries */}
          {sortedDirectories.map((directory, index) => {
            const actualIndex = directoryContents.path.length > 0 ? index + 1 : index;
            return (
              <DirectoryItem 
                key={directory.name}
                directory={directory}
                onClick={onNavigateToDirectory}
                isSelected={selectedIndex === actualIndex}
              />
            );
          })}

          {/* File entries */}
          {sortedFiles.map((file, index) => (
            <FileItem 
              key={file.name}
              file={file}
            />
          ))}

          {/* Empty state */}
          {sortedDirectories.length === 0 && sortedFiles.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              This directory is empty
            </div>
          )}

          {/* Error state */}
          {directoryContents.error && (
            <Alert className="m-4" variant="destructive">
              <AlertDescription>
                {directoryContents.error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
