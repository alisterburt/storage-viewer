import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    // For TB and PB, show more precision
    const precision = i >= 4 ? 2 : 1;
    
    return `${(bytes / Math.pow(1024, i)).toFixed(precision)} ${units[i]}`;
  }
  