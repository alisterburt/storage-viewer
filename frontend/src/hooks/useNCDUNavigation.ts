import { useState, useCallback, useEffect } from 'react';
import { DirectoryEntry, DirectoryContents, NCDUData } from 'shared';
import { parseNCDUData, getDirectoryContents, getSampleNCDUData } from '@/lib/ncdu-utils';

interface NavigationState {
  currentPath: string[];
  currentDirectory: DirectoryContents;
  rootPath: string;
  ncduData: NCDUData;
  isLoading: boolean;
  error: string | null;
}

interface NavigationActions {
  navigateToDirectory: (directory: DirectoryEntry) => void;
  navigateToParent: () => void;
  navigateToRoot: () => void;
  navigateToPath: (path: string[]) => void;
}

export function useNCDUNavigation(): NavigationState & NavigationActions {
  // Initial state with loading indicator
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPath: [],
    currentDirectory: {
      current: { name: 'Loading', size: 0, isDirectory: true },
      path: [],
      files: [],
      directories: [],
      totalItems: 0
    },
    rootPath: '',
    ncduData: {} as NCDUData,
    isLoading: true,
    error: null
  });

  // Load NCDU data on component mount
  useEffect(() => {
    const loadNCDUData = async () => {
      try {
        // In a real application, this would fetch from an API
        // For now, we use our sample data
        const rawData = getSampleNCDUData();
        const parsedData = parseNCDUData(rawData);
        
        const rootDirectory = parsedData.rootDirectory;
        
        setNavigationState({
          currentPath: [],
          currentDirectory: rootDirectory,
          rootPath: parsedData.rootPath,
          ncduData: parsedData,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to load NCDU data:', error);
        setNavigationState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load directory data. Please try again later.'
        }));
      }
    };

    loadNCDUData();
  }, []);

  // Navigate to a subdirectory
  const navigateToDirectory = useCallback((directory: DirectoryEntry) => {
    setNavigationState(prevState => {
      const newPath = [...prevState.currentPath, directory.name];
      
      try {
        // Parse the raw data again to navigate to the new path
        const rawData = getSampleNCDUData();
        const ncduData = JSON.parse(rawData);
        const newDirectory = getDirectoryContents(ncduData.root, newPath);
        
        return {
          ...prevState,
          currentPath: newPath,
          currentDirectory: newDirectory
        };
      } catch (error) {
        console.error('Navigation error:', error);
        return {
          ...prevState,
          error: `Failed to navigate to ${directory.name}`
        };
      }
    });
  }, []);

  // Navigate to parent directory
  const navigateToParent = useCallback(() => {
    setNavigationState(prevState => {
      if (prevState.currentPath.length === 0) return prevState;
      
      const newPath = [...prevState.currentPath];
      newPath.pop();
      
      try {
        // Parse the raw data again to navigate to the parent path
        const rawData = getSampleNCDUData();
        const ncduData = JSON.parse(rawData);
        const newDirectory = getDirectoryContents(ncduData.root, newPath);
        
        return {
          ...prevState,
          currentPath: newPath,
          currentDirectory: newDirectory,
          error: null
        };
      } catch (error) {
        console.error('Navigation error:', error);
        return {
          ...prevState,
          error: 'Failed to navigate to parent directory'
        };
      }
    });
  }, []);

  // Navigate to root directory
  const navigateToRoot = useCallback(() => {
    setNavigationState(prevState => {
      try {
        // Parse the raw data to get the root directory
        const rawData = getSampleNCDUData();
        const ncduData = JSON.parse(rawData);
        const rootDirectory = getDirectoryContents(ncduData.root, []);
        
        return {
          ...prevState,
          currentPath: [],
          currentDirectory: rootDirectory,
          error: null
        };
      } catch (error) {
        console.error('Navigation error:', error);
        return {
          ...prevState,
          error: 'Failed to navigate to root directory'
        };
      }
    });
  }, []);

  // Navigate to a specific path
  const navigateToPath = useCallback((path: string[]) => {
    setNavigationState(prevState => {
      try {
        // Parse the raw data to navigate to the specified path
        const rawData = getSampleNCDUData();
        const ncduData = JSON.parse(rawData);
        const newDirectory = getDirectoryContents(ncduData.root, path);
        
        return {
          ...prevState,
          currentPath: path,
          currentDirectory: newDirectory,
          error: null
        };
      } catch (error) {
        console.error('Navigation error:', error);
        return {
          ...prevState,
          error: `Failed to navigate to path: ${path.join('/')}`
        };
      }
    });
  }, []);

  return {
    ...navigationState,
    navigateToDirectory,
    navigateToParent,
    navigateToRoot,
    navigateToPath
  };
}
