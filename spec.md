# Filesystem Directory Size Visualization Specification

## Overview
This application provides a minimal web interface to visualize directory sizes on a Unix-based shared filesystem. The goal is to help users identify large directories where quotas are often exceeded, allowing them to make informed decisions about what to delete.

## Technical Stack
- Frontend: Vite, React, TypeScript
- UI Components: shadcn/ui
- Data Source: ncdu 2.7 scan data
- Deployment: Client-managed (not part of this specification)

## Core Features

### Data Collection
- Scan data will be provided by ncdu 2.7
- A cron job will run every 3 hours to refresh the data
- The scanning depth is determined by the ncdu configuration

### User Interface Requirements

#### Directory Listing View
- Display directories sorted by size (largest first)
- Show only directory/file name and size
- Size should be displayed in human-readable format (e.g., KB, MB, GB, TB)
- Each directory should be clickable to navigate into it
- Include a ".." entry at the top of each non-root directory to navigate up to the parent directory

#### Navigation
- Users can navigate into directories by clicking on them or pressing Enter
- Users can navigate up to the parent directory by clicking on the ".." entry
- Implement keyboard shortcuts similar to ncdu for navigation

#### Error Handling
- Display a simple error message if scan data is unavailable
- Display appropriate messages for permission issues when accessing certain directories

### Non-Requirements (Explicitly Out of Scope)
- Authentication
- Search functionality
- Bookmarking/marking directories
- Mobile responsiveness
- Specific browser requirements
- Multiple filesystem support
- Internationalization/localization
- Admin logging capabilities
- User session persistence (remembering last viewed directory)
- Pagination for large directory listings
- Visual comparison tools (charts, treemaps)
- Visual highlighting of large directories
- Direct file/directory deletion capabilities (view-only)
- Manual data refresh controls

## UI Layout Suggestion

```
+------------------------------------------------------+
| Filesystem Directory Size Viewer                     |
+------------------------------------------------------+
| Quota: 206Ti / 235Ti (87.7%)  Files: 31Mi / 45Mi     |
| [=============================    ]                  |
+------------------------------------------------------+
| [..] (Up to parent directory)                        |
+------------------------------------------------------+
| [>] directory1                            120.5 GB   |
| [>] directory2                             45.2 GB   |
| [>] directory3                             22.1 GB   |
| [ ] file1.dat                              15.8 GB   |
| [>] directory4                              8.3 GB   |
| [ ] file2.dat                               4.2 GB   |
| ...                                                  |
+------------------------------------------------------+
| Error: Unable to access /path/to/restricted          |
+------------------------------------------------------+
```

## Keyboard Shortcuts
- Up/Down Arrow Keys: Navigate through the directory listing
- Enter: Navigate into the selected directory
- Backspace: Navigate to the parent directory (same as clicking "..")
- Home: Jump to the first item in the listing
- End: Jump to the last item in the listing

## Data Flow

1. ncdu 2.7 scans the filesystem and produces scan data (every 3 hours via cron)
2. The web application reads and parses this data
4. The interface is rendered displaying the directory listing
5. User interactions trigger navigation within the directory structure