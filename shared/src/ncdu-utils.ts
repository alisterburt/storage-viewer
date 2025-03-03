import {
    DirectoryContents,
    DirectoryEntry,
    FileEntry,
    FileSystemEntry,
} from './types';

export interface NCDUData {
    rootPath: string;
    totalSize: number;
    availableSpace: number;
    totalFiles: number;
    maxFiles: number;
    scanTime: Date;
    rootDirectory: DirectoryContents;
}


// NCDU export metadata
export interface NCDUMetadata {
    progname: string;
    progver: string;
    timestamp: number;
    hostname?: string;
}

// Types for NCDU export array format
type NCDUExportFormat = [
    number,                  // format version
    number,                  // flags/settings
    NCDUMetadata,            // program metadata
    NCDUExportDirectory      // root directory with contents
];

// In export format, files are objects with properties
interface NCDUExportItem {
    name: string;
    asize?: number;          // apparent size
    dsize?: number;          // disk usage size
    dev?: number;            // device ID (optional)
}

// Directory is an array: [metadata, ...children]
// Where children can be files (objects) or directories (arrays)
type NCDUExportDirectory = [
    NCDUExportItem,          // directory metadata
    ...(NCDUExportItem | NCDUExportDirectory)[] // contents
];

// Simplified internal representation
export interface NCDUItem {
    name: string;
    asize?: number;
    dsize?: number;
    isDirectory: boolean;
    children?: NCDUItem[];
}

/**
 * Parse NCDU export format JSON data
 */
export function parseNCDUData(rawData: string): NCDUData {
    try {
        // Parse the JSON data
        const data = JSON.parse(rawData) as NCDUExportFormat;

        // Validate basic structure
        if (!Array.isArray(data) || data.length < 4) {
            throw new Error('Invalid NCDU export format: expected array with at least 4 elements');
        }

        const [formatVersion, flags, metadata, rootDir] = data;

        // Extract root info
        const rootInfo = rootDir[0] as NCDUExportItem;
        const rootPath = rootInfo.name || '/';

        // Convert to our internal format
        const rootItems = convertExportDirectory(rootDir);

        // Build the directory contents
        const rootDirectory = getDirectoryContents(rootItems.children || [], []);

        return {
            rootPath,
            scanTime: new Date(metadata.timestamp * 1000),
            totalSize: calculateTotalSize(rootItems),
            availableSpace: 0, // Not available in export format
            totalFiles: countFiles(rootItems),
            maxFiles: 0, // Not available in export format
            rootDirectory
        };
    } catch (error) {
        console.error('Error parsing NCDU data:', error);
        throw new Error(`Failed to parse NCDU data: ${(error as Error).message}`);
    }
}

/**
 * Convert an export directory array to our internal format
 */
function convertExportDirectory(dir: NCDUExportDirectory): NCDUItem {
    const metadata = dir[0];
    const contents = dir.slice(1);

    const children: NCDUItem[] = [];

    // Process each item in the directory
    for (const item of contents) {
        if (Array.isArray(item)) {
            // It's a directory
            children.push(convertExportDirectory(item as NCDUExportDirectory));
        } else {
            // It's a file
            children.push({
                name: item.name,
                asize: item.asize,
                dsize: item.dsize,
                isDirectory: false
            });
        }
    }

    return {
        name: metadata.name,
        asize: metadata.asize,
        dsize: metadata.dsize,
        isDirectory: true,
        children
    };
}

/**
 * Calculate total size of an item and its children
 */
function calculateTotalSize(item: NCDUItem): number {
    let size = item.asize || item.dsize || 0;

    if (item.children) {
        for (const child of item.children) {
            size += calculateTotalSize(child);
        }
    }

    return size;
}

/**
 * Count total number of files (not directories)
 */
function countFiles(item: NCDUItem): number {
    let count = item.isDirectory ? 0 : 1;

    if (item.children) {
        for (const child of item.children) {
            count += countFiles(child);
        }
    }

    return count;
}

/**
 * Get directory contents for a specific path
 */
export function getDirectoryContents(
    items: NCDUItem[],
    path: string[]
): DirectoryContents {
    // Start with the provided items
    let currentItems = items;
    let current: NCDUItem | undefined;
    let pathSegments = [...path];

    // Navigate through the path
    for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        current = currentItems.find(item => item.name === segment);

        // If segment not found or not a directory, return error
        if (!current || !current.isDirectory || !current.children) {
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
        currentItems = current.children;
    }

    // Separate directories and files
    const directories: DirectoryEntry[] = [];
    const files: FileEntry[] = [];

    for (const item of currentItems) {
        if (item.isDirectory) {
            directories.push({
                name: item.name,
                size: item.asize || item.dsize || 0,
                isDirectory: true,
                itemCount: item.children?.length || 0
            });
        } else {
            files.push({
                name: item.name,
                size: item.asize || item.dsize || 0,
                isDirectory: false,
                extension: item.name.includes('.') ? item.name.split('.').pop() : undefined
            });
        }
    }

    // Create the current directory entry
    const currentDir: DirectoryEntry = current
        ? {
            name: current.name,
            size: current.asize || current.dsize || 0,
            isDirectory: true,
            itemCount: currentItems.length
        }
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
 * Format a byte size into a human-readable string
 */
export function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    // For TB and PB, show more precision
    const precision = i >= 4 ? 2 : 1;

    return `${(bytes / Math.pow(1024, i)).toFixed(precision)} ${units[i]}`;
}
