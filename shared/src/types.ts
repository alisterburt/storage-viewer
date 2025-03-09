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

export interface PathIndexedDirectory {
    [path: string]: DirectoryContents;
}
