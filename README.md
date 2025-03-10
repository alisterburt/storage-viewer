# NCDU Storage Viewer

A simple web application for interactively visualizing disk usage data generated by [NCDU](https://dev.yorhel.nl/ncdu) (NCurses Disk Usage).

## Features

- Interactive filesystem navigation with a user-friendly interface
- Automatic data refresh at configurable intervals

![screenshot of UI](./assets/screenshot.png)

## Prerequisites

Before building and running this application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or later)
- [pnpm](https://pnpm.io/) package manager
- [NCDU](https://dev.yorhel.nl/ncdu) for generating disk usage data

### Installing Prerequisites

#### Node.js

Download and install from [nodejs.org](https://nodejs.org/)

#### pnpm

Once Node.js is installed, install pnpm globally:

```bash
npm install -g pnpm
```

#### NCDU

On Debian/Ubuntu:
```bash
sudo apt install ncdu
```

On macOS with Homebrew:
```bash
brew install ncdu
```

On other systems, check your package manager or download from [NCDU's website](https://dev.yorhel.nl/ncdu).

## Building for Production

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ncdu-storage-viewer.git
   cd ncdu-storage-viewer
   ```

2. Install dependencies and build all packages:
   ```bash
   pnpm install
   pnpm build
   ```

   This will build the shared library, backend, and frontend applications.

## Running the Application

## Configuration

The application can be configured through environment variables:

- `PORT`: Backend server port (default: 3000)
- `NCDU_FILE_PATH`: Path to the NCDU JSON file
- `REFRESH_INTERVAL_HOURS`: How often to refresh data in memory (default: 3 hours)

### Generating NCDU Data

First, you need to generate NCDU output data:

```bash
ncdu -x -o /path/to/output.json /path/to/analyze
```

Options explained:
- `-x`: Don't cross filesystem boundaries
- `-o`: Specify output JSON file

Add `-t` to run NCDU with multiple threads.

### Starting the Application

Use the provided shell script to run both the backend and frontend:

```bash
./run-viewer.sh /path/to/output.json
```

The application will be available at http://localhost:5173 in your web browser.

### Setting Up a Cron Job

To automatically scan your filesystem and update the NCDU data, you can set up a cron job:

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 2:00 AM
0 2 * * * ncdu -x -o /path/to/ncdu-data.json /path/to/analyze > /tmp/ncdu-scan.log 2>&1
```

## Development

To run the application in development mode:

```bash
pnpm dev
```

This will start both the backend and frontend in watch mode, with hot reloading enabled.

## License

[BSD-3](LICENSE)