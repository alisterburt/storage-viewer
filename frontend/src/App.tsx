import { useEffect } from 'react';
import { DirectoryList } from './components/DirectoryList';
import { PathBar } from './components/PathBar';
import { useNCDUNavigation } from './hooks/useNCDUNavigation';
import { Card, CardContent } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const {
    currentPath,
    currentDirectory,
    rootPath,
    navigateToDirectory,
    navigateToParent,
    navigateToRoot,
    navigateToPath,
    isLoading,
    error
  } = useNCDUNavigation();

  // Set up global keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && !e.composedPath().some(el => 
        el instanceof HTMLElement && 
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
      )) {
        if (currentPath.length > 0) {
          e.preventDefault();
          navigateToParent();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPath, navigateToParent]);

  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 p-4 bg-background overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Error state */}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading directory data...</span>
            </div>
          ) : (
            <>
              {/* Path navigation bar */}
              <Card className="mb-4 py-0">
                <CardContent className="p-2">
                  <PathBar
                    rootPath={rootPath}
                    currentPath={currentPath}
                    onNavigateToRoot={navigateToRoot}
                    onNavigateToPath={navigateToPath}
                  />
                </CardContent>
              </Card>
              
              {/* Directory contents */}
              <DirectoryList 
                directoryContents={currentDirectory}
                onNavigateToDirectory={navigateToDirectory}
                onNavigateToParent={navigateToParent}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;