export interface FileSystemEntry {
    name: string;
    size: number;
    isDirectory: boolean;
    modified?: Date;
    owner?: string;
    metadata?: Record<string, unknown>;
}

export interface FileEntry extends FileSystemEntry {
    isDirectory: false;
    extension?: string;
    mimeType?: string;
}

export interface DirectoryEntry extends FileSystemEntry {
    isDirectory: true;
    itemCount?: number;
    isScanned?: boolean;
}

export interface DirectoryContents {
    current: DirectoryEntry;
    path: string[];
    files: FileEntry[];
    directories: DirectoryEntry[];
    totalItems: number;
    error?: string;
}

/**
 * NCDU specific data format representation
 */
export interface NCDUData {
    rootPath: string;
    totalSize: number;
    availableSpace: number;
    totalFiles: number;
    maxFiles: number;
    scanTime: Date;
    rootDirectory: DirectoryContents;
}