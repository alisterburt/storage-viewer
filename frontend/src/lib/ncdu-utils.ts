import { 
    DirectoryContents, 
    DirectoryEntry, 
    FileEntry, 
    FileSystemEntry,
    NCDUData
  } from 'shared';
  
  // NCDU JSON format types
  interface NCDUMetadata {
    progname: string;
    progver: string;
    timestamp: number;
    hostname?: string;
  }
  
  interface NCDURoot {
    // Format version
    ver: number;
    // Metadata about the scan
    prog: NCDUMetadata;
    // Root path that was scanned
    rootPath?: string;
    // Filesystem information
    fsinfo?: {
      type?: string;
      bavail?: number;
      blocks?: number;
      bsize?: number;
      files?: number;
      ffree?: number;
    };
    // Root directory entry
    root: NCDUItem[];
  }
  
  interface NCDUItem {
    // Name of the item
    name: string;
    // Size in bytes
    dsize?: number; // Directory size including all subdirectories
    asize?: number; // Apparent size
    // Flags. 1=directory, 4=file, 8=error reading directory
    flags: number;
    // Subdirectories (only present for directories)
    items?: NCDUItem[];
    // Error message (only present if flags has error bit set)
    error?: string;
  }
  
  /**
   * Parse the raw NCDU JSON data into our application's format
   */
  export function parseNCDUData(rawData: string): NCDUData {
    try {
      const data = JSON.parse(rawData) as NCDURoot;
      
      // Verify this is a valid NCDU export
      if (!data.ver || !data.prog || !Array.isArray(data.root)) {
        throw new Error('Invalid NCDU JSON format');
      }
      
      // Extract filesystem info
      const fsinfo = data.fsinfo || {};
      const totalBlocks = fsinfo.blocks || 0;
      const availableBlocks = fsinfo.bavail || 0;
      const blockSize = fsinfo.bsize || 4096; // Default to 4KB blocks
      
      const totalSize = totalBlocks * blockSize;
      const availableSpace = (totalBlocks + availableBlocks) * blockSize;
      const totalFiles = fsinfo.files || 0;
      const maxFiles = totalFiles + (fsinfo.ffree || 0);
      
      // Extract root information
      const rootPath = data.rootPath || '/';
      const scanTime = new Date(data.prog.timestamp * 1000);
      
      // Parse root directory
      const rootDirectory = getDirectoryContents(data.root, []);
      
      return {
        rootPath,
        totalSize,
        availableSpace,
        totalFiles,
        maxFiles,
        scanTime,
        rootDirectory
      };
    } catch (error) {
      console.error('Error parsing NCDU data:', error);
      throw new Error('Failed to parse NCDU data');
    }
  }
  
  /**
   * Convert NCDU item flags to our isDirectory boolean
   */
  function isDirectory(flags: number): boolean {
    // NCDU flag 1 = directory
    return (flags & 1) === 1;
  }
  
  /**
   * Convert an NCDU item to our FileSystemEntry format
   */
  function convertNCDUItem(item: NCDUItem): FileSystemEntry {
    const directory = isDirectory(item.flags);
    
    // Use dsize (directory size) for directories, asize (apparent size) for files
    // Fall back to the other if not available
    const size = directory 
      ? (item.dsize ?? item.asize ?? 0) 
      : (item.asize ?? item.dsize ?? 0);
    
    const base: FileSystemEntry = {
      name: item.name,
      size,
      isDirectory: directory,
    };
    
    // Add directory-specific properties
    if (directory) {
      return {
        ...base,
        isDirectory: true,
        itemCount: item.items?.length ?? 0,
      } as DirectoryEntry;
    }
    
    // Add file-specific properties
    return {
      ...base,
      isDirectory: false,
      extension: item.name.includes('.') 
        ? item.name.split('.').pop() 
        : undefined,
    } as FileEntry;
  }
  
  /**
   * Get the DirectoryContents for a specific path in the NCDU data
   */
  export function getDirectoryContents(
    ncduItems: NCDUItem[], 
    path: string[]
  ): DirectoryContents {
    // Start with the root items
    let currentItems = ncduItems;
    let current: NCDUItem | undefined;
    let pathSegments = [...path];
    
    // Navigate through the path
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      current = currentItems.find(item => item.name === segment);
      
      // If segment not found or not a directory, return error
      if (!current || !isDirectory(current.flags) || !current.items) {
        return {
          current: {
            name: path[path.length - 1] || 'root',
            size: 0,
            isDirectory: true
          },
          path: pathSegments.slice(0, i),
          files: [],
          directories: [],
          totalItems: 0,
          error: `Path not found: ${pathSegments.join('/')}`
        };
      }
      
      // Move to next directory in path
      currentItems = current.items;
    }
    
    // Separate directories and files
    const directories: DirectoryEntry[] = [];
    const files: FileEntry[] = [];
    
    for (const item of currentItems) {
      if (isDirectory(item.flags)) {
        directories.push(convertNCDUItem(item) as DirectoryEntry);
      } else {
        files.push(convertNCDUItem(item) as FileEntry);
      }
    }
    
    // Create the current directory entry
    const currentDir: DirectoryEntry = current 
      ? convertNCDUItem(current) as DirectoryEntry
      : {
          name: path[path.length - 1] || 'root',
          size: directories.reduce((sum, dir) => sum + dir.size, 0) + 
                files.reduce((sum, file) => sum + file.size, 0),
          isDirectory: true,
          itemCount: currentItems.length
        };
    
    return {
      current: currentDir,
      path: pathSegments,
      directories,
      files,
      totalItems: directories.length + files.length,
      error: currentItems.length === 0 ? 'Directory is empty' : undefined
    };
  }
  
  /**
   * Navigate to a specific path in NCDU data
   */
  export function navigateToPathInNCDUData(
    data: NCDURoot,
    path: string[]
  ): DirectoryContents {
    return getDirectoryContents(data.root, path);
  }
  
  /**
   * Create a sample NCDU data export for testing
   */
  export function getSampleNCDUData(): string {
    const sampleData: NCDURoot = {
      ver: 2,
      prog: {
        progname: "ncdu",
        progver: "2.7",
        timestamp: Math.floor(Date.now() / 1000)
      },
      rootPath: "/home/users",
      fsinfo: {
        type: "ext4",
        bavail: 34000000000, // ~34TB available
        blocks: 260000000000, // ~260TB total
        bsize: 4096,
        files: 31000000,
        ffree: 14000000
      },
      root: [
        {
          name: "user1",
          dsize: 120 * 1024 * 1024 * 1024 * 1024, // 120TB
          flags: 1, // directory
          items: [
            {
              name: "projects",
              dsize: 80 * 1024 * 1024 * 1024 * 1024,
              flags: 1,
              items: [
                {
                  name: "project1",
                  dsize: 40 * 1024 * 1024 * 1024 * 1024,
                  flags: 1,
                  items: [
                    {
                      name: "data.bin",
                      asize: 30 * 1024 * 1024 * 1024 * 1024,
                      flags: 4 // file
                    },
                    {
                      name: "results",
                      dsize: 10 * 1024 * 1024 * 1024 * 1024,
                      flags: 1,
                      items: [
                        {
                          name: "output.log",
                          asize: 10 * 1024 * 1024 * 1024,
                          flags: 4
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "project2",
                  dsize: 40 * 1024 * 1024 * 1024 * 1024,
                  flags: 1,
                  items: [
                    {
                      name: "dataset.bin",
                      asize: 38 * 1024 * 1024 * 1024 * 1024,
                      flags: 4
                    }
                  ]
                }
              ]
            },
            {
              name: "backups",
              dsize: 40 * 1024 * 1024 * 1024 * 1024,
              flags: 1,
              items: [
                {
                  name: "backup-2024-01.tar.gz",
                  asize: 20 * 1024 * 1024 * 1024 * 1024,
                  flags: 4
                },
                {
                  name: "backup-2024-02.tar.gz",
                  asize: 20 * 1024 * 1024 * 1024 * 1024,
                  flags: 4
                }
              ]
            }
          ]
        },
        {
          name: "user2",
          dsize: 45 * 1024 * 1024 * 1024 * 1024, // 45TB
          flags: 1,
          items: [
            {
              name: "datasets",
              dsize: 40 * 1024 * 1024 * 1024 * 1024,
              flags: 1,
              items: [
                {
                  name: "large_dataset.bin",
                  asize: 40 * 1024 * 1024 * 1024 * 1024,
                  flags: 4
                }
              ]
            },
            {
              name: "documents",
              dsize: 5 * 1024 * 1024 * 1024 * 1024,
              flags: 1,
              items: [
                {
                  name: "report.pdf",
                  asize: 5 * 1024 * 1024,
                  flags: 4
                }
              ]
            }
          ]
        },
        {
          name: "user3",
          dsize: 22 * 1024 * 1024 * 1024 * 1024, // 22TB
          flags: 1,
          items: [
            {
              name: "archive",
              dsize: 22 * 1024 * 1024 * 1024 * 1024,
              flags: 1,
              items: [
                {
                  name: "old_projects.tar",
                  asize: 22 * 1024 * 1024 * 1024 * 1024,
                  flags: 4
                }
              ]
            }
          ]
        },
        {
          name: "user4",
          dsize: 8 * 1024 * 1024 * 1024 * 1024, // 8TB
          flags: 1, 
          items: []
        },
        {
          name: "temp",
          dsize: 31 * 1024 * 1024 * 1024, // 31GB
          flags: 1,
          items: [
            {
              name: "tmp1.dat",
              asize: 15 * 1024 * 1024 * 1024,
              flags: 4
            },
            {
              name: "tmp2.dat",
              asize: 16 * 1024 * 1024 * 1024,
              flags: 4
            }
          ]
        },
        {
          name: "readme.txt",
          asize: 1024,
          flags: 4
        },
        {
          name: "install.log",
          asize: 2 * 1024 * 1024,
          flags: 4
        }
      ]
    };
    
    return JSON.stringify(sampleData);
  }