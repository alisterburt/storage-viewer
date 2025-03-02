import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PathBarProps {
  rootPath: string;
  currentPath: string[];
  onNavigateToRoot: () => void;
  onNavigateToPath: (path: string[]) => void;
  className?: string;
}

export function PathBar({ 
  rootPath, 
  currentPath, 
  onNavigateToRoot, 
  onNavigateToPath, 
  className 
}: PathBarProps) {
  // Function to navigate to a specific level in the path
  const handlePathClick = (index: number) => {
    if (index === -1) {
      // Root path
      onNavigateToRoot();
    } else {
      // Navigate to a specific segment in the path
      onNavigateToPath(currentPath.slice(0, index + 1));
    }
  };

  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto py-2 px-1", className)} data-testid="path-bar">
      {/* Root path button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 hover:bg-accent h-8"
        onClick={() => handlePathClick(-1)}
        title={rootPath}
      >
        <Home className="h-4 w-4" />
        <span className="truncate max-w-40">{rootPath}</span>
      </Button>

      {/* Path segments */}
      {currentPath.length > 0 && (
        <>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          
          {currentPath.map((segment, index) => (
            <React.Fragment key={`${index}-${segment}`}>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-accent h-8 px-2"
                onClick={() => handlePathClick(index)}
              >
                <span className="truncate max-w-40">{segment}</span>
              </Button>
              
              {/* Add separator if not the last segment */}
              {index < currentPath.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
}
