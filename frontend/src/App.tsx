import { useEffect } from 'react';
import { DirectoryList } from './components/DirectoryList';
import { PathBar } from './components/PathBar';
import { useNavigation } from './hooks/useNavigation';
import { Card, CardContent } from './components/ui/card';
import './App.css';

function App() {
  const {
    currentPath,
    currentDirectory,
    rootPath,
    navigateToDirectory,
    navigateToParent,
    navigateToRoot,
    navigateToPath
  } = useNavigation();

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
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-xl font-bold">Filesystem Directory Size Viewer</h1>
      </header>
      
      <main className="flex-1 p-4 bg-background overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Path navigation bar */}
          <Card className="mb-4">
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
        </div>
      </main>
    </div>
  );
}

export default App;