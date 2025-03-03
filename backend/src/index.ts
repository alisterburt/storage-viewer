// src/index.ts
import express from 'express';
import cors from 'cors';
import { DirectoryContents, NCDUData, parseNCDUData, getDirectoryContents } from 'shared';
import { readFile } from 'fs/promises';
import path from 'path';

// Configure app settings
const app = express();
const PORT = process.env.PORT || 3000;
const NCDU_FILE_PATH = process.env.NCDU_FILE_PATH || path.join(__dirname, '../../ncdu-example-data/example.json');
const REFRESH_INTERVAL_HOURS = Number(process.env.REFRESH_INTERVAL_HOURS) || 3;

// In-memory cache for raw NCDU data
let ncduData: NCDUData | null = null;
let lastRefreshTime: number = 0;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to refresh NCDU data if needed
async function refreshNCDUDataIfNeeded(): Promise<void> {
  const currentTime = Date.now();
  const refreshIntervalMs = REFRESH_INTERVAL_HOURS * 60 * 60 * 1000;
  
  // Check if we need to refresh the data
  if (!ncduData || (currentTime - lastRefreshTime > refreshIntervalMs)) {
    console.log('Reading NCDU data from file...');
    try {
      const rawData = await readFile(NCDU_FILE_PATH, 'utf-8');
      ncduData = parseNCDUData(rawData);
      lastRefreshTime = currentTime;
      console.log('NCDU data refreshed successfully');
    } catch (error) {
      console.error('Error reading NCDU file:', error);
      // Don't update lastRefreshTime to try again on next request
      if (!ncduData) {
        // If we don't have any data at all, throw an error
        throw new Error('Failed to load initial NCDU data');
      }
    }
  }
}

// Main API endpoint to get directory contents
app.get('/api/directories', async (req, res) => {
  try {
    // Refresh data if needed
    await refreshNCDUDataIfNeeded();
    
    // Parse path from query parameters
    const requestedPath = req.query.path as string || '';
    const pathSegments = requestedPath.split('/').filter(segment => segment.length > 0);
    
    // Extract the items from rootDirectory to pass to getDirectoryContents
    // Fix: Create a unified array type by ensuring all items have the same structure
    const rootItems = [
      ...ncduData!.rootDirectory.directories.map(dir => ({
        name: dir.name,
        asize: dir.size,
        dsize: dir.size,
        isDirectory: true as const,
        children: []
      })),
      ...ncduData!.rootDirectory.files.map(file => ({
        name: file.name,
        asize: file.size,
        dsize: file.size,
        isDirectory: false as const,
        children: undefined  // Add children property but set it to undefined for files
      }))
    ];
    
    // Get directory contents for the specified path
    const directoryContents = getDirectoryContents(rootItems, pathSegments);
    
    res.json(directoryContents);
  } catch (error) {
    console.error('Error serving directory data:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve directory data',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// API endpoint to get NCDU metadata
app.get('/api/metadata', async (req, res) => {
  try {
    // Refresh data if needed
    await refreshNCDUDataIfNeeded();
    
    // Extract only the metadata we want to expose
    const metadata = {
      rootPath: ncduData!.rootPath || '/',
      totalSize: ncduData!.totalSize || 0,
      availableSpace: ncduData!.availableSpace || 0,
      totalFiles: ncduData!.totalFiles || 0,
      maxFiles: ncduData!.maxFiles || 0,
      scanTime: ncduData!.scanTime || new Date(),
    };
    
    res.json(metadata);
  } catch (error) {
    console.error('Error serving metadata:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve filesystem metadata',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', dataLoaded: !!ncduData });
});

// Initialize and start the server
async function startServer() {
  try {
    // Initial load of NCDU data
    await refreshNCDUDataIfNeeded();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();