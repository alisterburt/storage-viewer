import { DirectoryContents, NCDUData } from 'shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Fetch directory contents for a specific path
 */
export async function fetchDirectoryContents(path: string[] = []): Promise<DirectoryContents> {
  try {
    const pathParam = path.join('/');
    const response = await fetch(`${API_BASE_URL}/directories?path=${encodeURIComponent(pathParam)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch directory data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return {
      current: {
        name: path[path.length - 1] || 'root',
        size: 0,
        isDirectory: true
      },
      path: path,
      files: [],
      directories: [],
      totalItems: 0,
      error: `Failed to load directory data: ${(error as Error).message}`
    };
  }
}

/**
 * Fetch NCDU metadata
 */
export async function fetchNCDUMetadata(): Promise<Partial<NCDUData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/metadata`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch metadata');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return {
      rootPath: '/',
      scanTime: new Date(),
    };
  }
}