import { useState, useEffect } from 'react';
import { DirectoryEntry, DirectoryContents, NCDUData } from 'shared';
import { DirectoryList } from './components/DirectoryList';
import './App.css';

// Mock data - this would be replaced with actual data from the backend
const mockNCDUData: NCDUData = {
  rootPath: '/home/users',
  totalSize: 226 * 1024 * 1024 * 1024 * 1024, // 226 TB
  availableSpace: 260 * 1024 * 1024 * 1024 * 1024, // 260 TB
  totalFiles: 31000000, // 31 million files
  maxFiles: 45000000, // 45 million files
  scanTime: new Date(),
  rootDirectory: {
    current: {
      name: 'users',
      size: 226 * 1024 * 1024 * 1024 * 1024,
      isDirectory: true,
      itemCount: 500
    },
    path: [],
    files: [
      { name: 'readme.txt', size: 1024, isDirectory: false },
      { name: 'install.log', size: 2048 * 1024, isDirectory: false }
    ],
    directories: [
      { name: 'user1', size: 120 * 1024 * 1024 * 1024 * 1024, isDirectory: true },
      { name: 'user2', size: 45 * 1024 * 1024 * 1024 * 1024, isDirectory: true },
      { name: 'user3', size: 22 * 1024 * 1024 * 1024 * 1024, isDirectory: true },
      { name: 'user4', size: 8 * 1024 * 1024 * 1024 * 1024, isDirectory: true },
      { name: 'temp', size: 31 * 1024 * 1024 * 1024, isDirectory: true }
    ],
    totalItems: 7
  }
};

function App() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<DirectoryContents>(mockNCDUData.rootDirectory);
  
  // Navigate to a subdirectory
  const handleNavigateToDirectory = (directory: DirectoryEntry) => {
    // In a real app, we would fetch the contents of this directory from the backend
    // For now, we'll simulate with mock data
    const newPath = [...currentPath, directory.name];
    
    // Create mock data for subdirectory
    const mockSubdirectory: DirectoryContents = {
      current: directory,
      path: newPath,
      files: [
        { name: `file1_in_${directory.name}.txt`, size: 1024 * 1024 * 10, isDirectory: false },
        { name: `file2_in_${directory.name}.dat`, size: 1024 * 1024 * 100, isDirectory: false }
      ],
      directories: [
        { name: `subdir1_in_${directory.name}`, size: 1024 * 1024 * 1024, isDirectory: true },
        { name: `subdir2_in_${directory.name}`, size: 1024 * 1024 * 500, isDirectory: true }
      ],
      totalItems: 4
    };
    
    setCurrentPath(newPath);
    setCurrentDirectory(mockSubdirectory);
  };
  
  // Navigate to parent directory
  const handleNavigateToParent = () => {
    if (currentPath.length === 0) return;
    
    const newPath = [...currentPath];
    newPath.pop();
    
    if (newPath.length === 0) {
      // Back to root
      setCurrentPath([]);
      setCurrentDirectory(mockNCDUData.rootDirectory);
    } else {
      // In a real app, we would fetch the parent directory contents
      // For now, simulate with mock data
      const mockParentDirectory: DirectoryContents = {
        current: {
          name: newPath[newPath.length - 1] || 'users',
          size: 226 * 1024 * 1024 * 1024 * 1024,
          isDirectory: true
        },
        path: newPath,
        files: [
          { name: 'parent_file1.txt', size: 1024 * 1024, isDirectory: false },
          { name: 'parent_file2.log', size: 1024 * 1024 * 5, isDirectory: false }
        ],
        directories: [
          { name: 'parent_subdir1', size: 1024 * 1024 * 1024 * 10, isDirectory: true },
          { name: 'parent_subdir2', size: 1024 * 1024 * 1024 * 5, isDirectory: true }
        ],
        totalItems: 4
      };
      
      setCurrentPath(newPath);
      setCurrentDirectory(mockParentDirectory);
    }
  };

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && !e.target) {
        if (currentPath.length > 0) {
          e.preventDefault();
          handleNavigateToParent();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPath]);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-xl font-bold">Filesystem Directory Size Viewer</h1>
      </header>
      
      <main className="flex-1 p-4 bg-background overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Current path breadcrumb */}
          <div className="mb-4 px-2">
            <span className="text-muted-foreground">
              {mockNCDUData.rootPath}/{currentPath.join('/')}
            </span>
          </div>
          
          {/* Directory contents */}
          <DirectoryList 
            directoryContents={currentDirectory}
            onNavigateToDirectory={handleNavigateToDirectory}
            onNavigateToParent={handleNavigateToParent}
          />
        </div>
      </main>
    </div>
  );
}

export default App;