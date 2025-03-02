// src/hooks/useNavigation.ts
import { useState, useCallback } from 'react';
import { DirectoryEntry, DirectoryContents, NCDUData } from 'shared';

// Mock data function - in a real app, this would fetch from an API
const getMockDirectoryContents = (path: string[]): DirectoryContents => {
  // Root directory mock data
  if (path.length === 0) {
    return {
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
    };
  }

  // Simulated subdirectory data
  const dirName = path[path.length - 1];
  
  return {
    current: {
      name: dirName,
      size: 100 * 1024 * 1024 * 1024, // 100 GB
      isDirectory: true,
      itemCount: 4
    },
    path: path,
    files: [
      { name: `file1_in_${dirName}.txt`, size: 1024 * 1024 * 10, isDirectory: false },
      { name: `file2_in_${dirName}.dat`, size: 1024 * 1024 * 100, isDirectory: false }
    ],
    directories: [
      { name: `subdir1_in_${dirName}`, size: 1024 * 1024 * 1024, isDirectory: true },
      { name: `subdir2_in_${dirName}`, size: 1024 * 1024 * 500, isDirectory: true }
    ],
    totalItems: 4
  };
};

// Mock NCDU data
const mockNCDUData: NCDUData = {
  rootPath: '/home/users',
  totalSize: 226 * 1024 * 1024 * 1024 * 1024, // 226 TB
  availableSpace: 260 * 1024 * 1024 * 1024 * 1024, // 260 TB
  totalFiles: 31000000, // 31 million files
  maxFiles: 45000000, // 45 million files
  scanTime: new Date(),
  rootDirectory: getMockDirectoryContents([])
};

interface NavigationState {
  currentPath: string[];
  currentDirectory: DirectoryContents;
  rootPath: string;
  ncduData: NCDUData;
}

interface NavigationActions {
  navigateToDirectory: (directory: DirectoryEntry) => void;
  navigateToParent: () => void;
  navigateToRoot: () => void;
  navigateToPath: (path: string[]) => void;
}

export function useNavigation(): NavigationState & NavigationActions {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPath: [],
    currentDirectory: mockNCDUData.rootDirectory,
    rootPath: mockNCDUData.rootPath,
    ncduData: mockNCDUData
  });

  // Navigate to a subdirectory
  const navigateToDirectory = useCallback((directory: DirectoryEntry) => {
    const newPath = [...navigationState.currentPath, directory.name];
    const newDirectory = getMockDirectoryContents(newPath);
    
    setNavigationState(prevState => ({
      ...prevState,
      currentPath: newPath,
      currentDirectory: newDirectory
    }));
  }, [navigationState.currentPath]);

  // Navigate to parent directory
  const navigateToParent = useCallback(() => {
    if (navigationState.currentPath.length === 0) return;
    
    const newPath = [...navigationState.currentPath];
    newPath.pop();
    
    const newDirectory = getMockDirectoryContents(newPath);
    
    setNavigationState(prevState => ({
      ...prevState,
      currentPath: newPath,
      currentDirectory: newDirectory
    }));
  }, [navigationState.currentPath]);

  // Navigate to root directory
  const navigateToRoot = useCallback(() => {
    setNavigationState(prevState => ({
      ...prevState,
      currentPath: [],
      currentDirectory: mockNCDUData.rootDirectory
    }));
  }, []);

  // Navigate to a specific path
  const navigateToPath = useCallback((path: string[]) => {
    const newDirectory = getMockDirectoryContents(path);
    
    setNavigationState(prevState => ({
      ...prevState,
      currentPath: path,
      currentDirectory: newDirectory
    }));
  }, []);

  return {
    ...navigationState,
    navigateToDirectory,
    navigateToParent,
    navigateToRoot,
    navigateToPath
  };
}
