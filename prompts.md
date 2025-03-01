# Filesystem Directory Size Visualization - Implementation Prompts

This document contains a series of prompts designed for implementing the Filesystem Directory Size Visualization project using a code-generation LLM. Each prompt builds on the previous ones, creating a progressive implementation path.

## Prompt 1: Project Setup and Basic Structure

```
I'm building a Filesystem Directory Size Visualization application using Vite, React, TypeScript, and shadcn/ui. The application will visualize directory sizes from ncdu 2.7 scan data, allowing users to navigate through directories.

Please help me with the initial project structure

4. Create a basic app layout with a header showing "Filesystem Directory Size Viewer"
5. Set up a simple main content area where directory data will be displayed

Include the necessary commands to create the project and install dependencies. Also, show the basic file structure and the implementation of the main App component.
```

## Prompt 2: Data Modeling with TypeScript

```
Continuing with the Filesystem Directory Size Visualization project, let's define the data models and utility functions needed to represent the filesystem structure.

Based on our previous setup with Vite, React, TypeScript, and shadcn/ui, please create:

1. TypeScript interfaces for:
   - FileSystemEntry (common properties for both files and directories)
   - FileEntry (extends FileSystemEntry, for files)
   - DirectoryEntry (extends FileSystemEntry, for directories)
   - DirectoryContents (represents the contents of a directory)

2. A utility function to format file sizes in human-readable format (converting bytes to KB, MB, GB, TB)

3. Create a mock data structure that represents a sample filesystem for initial development and testing

Place these in appropriate files (e.g., types.ts for interfaces, utils.ts for utilities, mockData.ts for mock data).
```

## Prompt 3: Basic Directory List Component

```
Let's build the core display components for our Filesystem Directory Size Visualization project. Using the TypeScript interfaces and mock data created previously, please implement:

1. A DirectoryItem component that displays:
   - A directory icon or indicator
   - The directory name
   - The directory size (using our size formatting utility)
   - Makes the entire row clickable

2. A FileItem component that displays:
   - A file icon or indicator
   - The file name
   - The file size (using our size formatting utility)

3. A DirectoryList component that:
   - Takes a DirectoryContents object as a prop
   - Sorts entries by size (largest first)
   - Renders DirectoryItem and FileItem components for each entry
   - Has basic styling for a list view

Use shadcn/ui components where appropriate for consistent styling.
```

## Prompt 4: Navigation State and Path Display

```
Now let's implement navigation state management and path display for our Filesystem Directory Size Visualization project.

Building on our previous components, please implement:

1. A navigation state hook (useNavigation) that manages:
   - Current path (array of path segments)
   - Functions to navigate into a directory
   - Functions to navigate to parent directory

2. A PathBar component that:
   - Displays the current path
   - Could be implemented as breadcrumbs
   - Uses shadcn/ui components for styling

3. A ParentDirectory component (".." entry) that:
   - Appears only when not at the root directory
   - Allows navigation to the parent directory when clicked
   - Is styled similar to directory items but distinguished as a navigation element

4. Update the App component to use these new components and manage navigation state

Ensure everything works together: changing the path should update the PathBar and the displayed directory contents should change accordingly (using our mock data for now).
```

## Prompt 5: Click Navigation Implementation

```
Let's implement navigation functionality through clicking for our Filesystem Directory Size Visualization project.

Building on our navigation state, PathBar, and directory listing components, please:

1. Update the DirectoryItem component to:
   - Accept an onClick handler
   - Call this handler with the directory entry when clicked

2. Update the ParentDirectory component to:
   - Accept an onClick handler
   - Call this handler when clicked

3. Enhance the useNavigation hook to:
   - Provide a navigateToDirectory function that updates the current path
   - Provide a navigateToParent function that removes the last segment from the path

4. Connect these functions in the App component:
   - Pass navigateToDirectory to DirectoryItem components
   - Pass navigateToParent to the ParentDirectory component

5. Update the DirectoryList to use the current path to determine what content to display from our mock data

Ensure the user can now click on directories to navigate into them and click on the ".." entry to navigate up.
```

## Prompt 6: NCDU Data Parsing

```
Now let's implement the NCDU data parsing utility for our Filesystem Directory Size Visualization project.

NCDU 2.7 exports data in a specific JSON format. Please create:

1. A utility function that parses the NCDU JSON export format:
   - Accept the raw JSON data as input
   - Convert it to our FileSystemEntry/DirectoryContents format
   - Handle the specific structure of NCDU exports

2. A function to extract the current directory data based on a path:
   - Takes the parsed NCDU data and a path array
   - Returns the DirectoryContents for that specific path
   - Handles errors for invalid paths

3. A sample NCDU JSON export for testing

4. Update the App component to:
   - Use these new utilities instead of mock data
   - Load the sample NCDU data
   - Display the correct directory contents based on the current path

Ensure that navigation still works correctly with this real data format.
```

## Prompt 7: Keyboard Navigation

```
Let's implement keyboard navigation for our Filesystem Directory Size Visualization project.

Building on our current implementation, please add:

1. Focus management for the DirectoryList:
   - Keep track of which item is focused/selected
   - Visually highlight the selected item
   - Add tabIndex attributes to make items focusable

2. Keyboard event handlers:
   - Up/Down arrow keys to navigate through the directory items
   - Enter key to navigate into the selected directory
   - Backspace key to navigate to the parent directory
   - Home key to jump to the first item
   - End key to jump to the last item

3. Integration with existing navigation functions:
   - Use the navigateToDirectory and navigateToParent functions from our useNavigation hook
   - Update the keyboard event handlers to use these functions

4. Update the DirectoryList and associated components to support these new interactions

Ensure users can navigate the entire application using only the keyboard, following the keyboard shortcuts specified in the requirements.
```

## Prompt 8: Error Handling

```
Let's implement error handling for our Filesystem Directory Size Visualization project.

Building on our current implementation, please add:

1. An ErrorMessage component:
   - Displays error messages in a user-friendly way
   - Uses shadcn/ui components for styling
   - Has different styles for different types of errors (e.g., permission errors vs. data errors)

2. Error state management:
   - Add error states to our useNavigation hook
   - Handle cases like permission denied, missing data, and invalid paths

3. Error boundary component:
   - Catches rendering errors
   - Displays a fallback UI when errors occur

4. Update the App and DirectoryList components to:
   - Handle and display errors appropriately
   - Show error messages when navigation fails
   - Provide clear feedback to users

5. Simulate different error scenarios (permission issues, missing data) for testing

Ensure users receive clear feedback when errors occur, following the error handling requirements in the specification.
```

## Prompt 9: Quota Information Display

```
Let's implement the quota information display for our Filesystem Directory Size Visualization project.

According to the specification, we need to show storage quota information. Please create:

1. A QuotaInfo component that displays:
   - Used storage / Total storage (e.g., "206Ti / 235Ti (87.7%)")
   - Files count / Total files (e.g., "Files: 31Mi / 45Mi")
   - A progress bar showing the used percentage

2. Update the NCDU data parsing utility to:
   - Extract quota information from the NCDU data
   - Format it appropriately using our existing size formatting utility

3. Integrate the QuotaInfo component into the App layout:
   - Place it below the header
   - Style it according to the UI layout suggestion in the specification

Use shadcn/ui components for the progress bar and overall styling to ensure consistency with the rest of the application.
```

## Prompt 10: UI Polish and Final Integration

```
Let's complete our Filesystem Directory Size Visualization project with final UI polish and integration.

Building on all previous components, please:

1. Review and enhance the overall UI:
   - Ensure consistent spacing and alignment
   - Apply shadcn/ui styling consistently across all components
   - Add subtle visual cues for better usability (hover states, focus indicators)

2. Improve the DirectoryList component:
   - Add alternating row colors for better readability
   - Ensure proper alignment of size information
   - Add subtle hover effects

3. Enhance keyboard navigation visual feedback:
   - Make the currently selected item clearly distinguishable
   - Ensure focus states are visible and consistent

4. Add final touches to the PathBar:
   - Make path segments clickable for direct navigation
   - Improve visual styling

5. Implement a loading state:
   - Show a loading indicator when changing directories or initially loading data
   - Use shadcn/ui Skeleton component for loading states

6. Ensure all components are properly integrated:
   - Check that navigation updates all relevant components
   - Verify error handling works across the application
   - Test keyboard navigation throughout

7. Add any missing documentation or comments to the code

This final step should result in a complete, polished application that meets all the requirements specified in the project specification.
```