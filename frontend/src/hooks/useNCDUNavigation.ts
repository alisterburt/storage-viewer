import { useState, useCallback, useEffect } from 'react';
import { DirectoryEntry, DirectoryContents, NCDUData } from 'shared';
import { fetchDirectoryContents, fetchNCDUMetadata } from '@/lib/api-client';

interface NavigationState {
  currentPath: string[];
  currentDirectory: DirectoryContents;
  rootPath: string;
  ncduData: Partial<NCDUData>;
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
    ncduData: {},
    isLoading: true,
    error: null
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch metadata first
        const metadata = await fetchNCDUMetadata();
        
        // Then fetch root directory contents
        const rootDirectory = await fetchDirectoryContents([]);
        
        setNavigationState({
          currentPath: [],
          currentDirectory: rootDirectory,
          rootPath: metadata.rootPath || '/',
          ncduData: metadata,
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

    loadInitialData();
  }, []);

  // Navigate to a subdirectory
  const navigateToDirectory = useCallback((directory: DirectoryEntry) => {
    setNavigationState(prevState => ({
      ...prevState,
      isLoading: true
    }));

    const newPath = [...navigationState.currentPath, directory.name];
    
    fetchDirectoryContents(newPath)
      .then(newDirectory => {
        setNavigationState(prevState => ({
          ...prevState,
          currentPath: newPath,
          currentDirectory: newDirectory,
          isLoading: false,
          error: null
        }));
      })
      .catch(error => {
        console.error('Navigation error:', error);
        setNavigationState(prevState => ({
          ...prevState,
          error: `Failed to navigate to ${directory.name}`,
          isLoading: false
        }));
      });
  }, [navigationState.currentPath]);

  // Navigate to parent directory
  const navigateToParent = useCallback(() => {
    if (navigationState.currentPath.length === 0) return;
    
    setNavigationState(prevState => ({
      ...prevState,
      isLoading: true
    }));
    
    const newPath = [...navigationState.currentPath];
    newPath.pop();
    
    fetchDirectoryContents(newPath)
      .then(newDirectory => {
        setNavigationState(prevState => ({
          ...prevState,
          currentPath: newPath,
          currentDirectory: newDirectory,
          isLoading: false,
          error: null
        }));
      })
      .catch(error => {
        console.error('Navigation error:', error);
        setNavigationState(prevState => ({
          ...prevState,
          error: 'Failed to navigate to parent directory',
          isLoading: false
        }));
      });
  }, [navigationState.currentPath]);

  // Navigate to root directory
  const navigateToRoot = useCallback(() => {
    setNavigationState(prevState => ({
      ...prevState,
      isLoading: true
    }));
    
    fetchDirectoryContents([])
      .then(rootDirectory => {
        setNavigationState(prevState => ({
          ...prevState,
          currentPath: [],
          currentDirectory: rootDirectory,
          isLoading: false,
          error: null
        }));
      })
      .catch(error => {
        console.error('Navigation error:', error);
        setNavigationState(prevState => ({
          ...prevState,
          error: 'Failed to navigate to root directory',
          isLoading: false
        }));
      });
  }, []);

  // Navigate to a specific path
  const navigateToPath = useCallback((path: string[]) => {
    setNavigationState(prevState => ({
      ...prevState,
      isLoading: true
    }));
    
    fetchDirectoryContents(path)
      .then(newDirectory => {
        setNavigationState(prevState => ({
          ...prevState,
          currentPath: path,
          currentDirectory: newDirectory,
          isLoading: false,
          error: null
        }));
      })
      .catch(error => {
        console.error('Navigation error:', error);
        setNavigationState(prevState => ({
          ...prevState,
          error: `Failed to navigate to path: ${path.join('/')}`,
          isLoading: false
        }));
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