# Docker Setup for SearchBox App

This document explains how to run the SearchBox app using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)
- Google API Key for vector store embeddings

## Environment Setup

1. Copy the environment example file:

   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Google API key:
   ```
   GOOGLE_API_KEY=your_actual_google_api_key_here
   ```

## Build Process

The Docker build process includes several important steps for native dependencies:

- **Base Image**: Uses `node:18-bullseye-slim` (Debian-based) for better compatibility with native modules
- **Build Dependencies**: Installs `python3`, `make`, `g++`, `cmake`, and `git` for compiling native modules
- **FAISS Manual Build**: Manually installs and builds `faiss-node` using npm to ensure proper native bindings compilation
- **Native Modules**: Ensures all native Node.js modules are properly compiled for the container architecture

The build may take several minutes due to the compilation of native dependencies, especially `faiss-node`.

## Running with Docker Compose

### Production Mode

To run the app in production mode:

```bash
# Build and start the application
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The app will be available at `http://localhost:3000`

### Development Mode

To run the app in development mode with hot reloading:

```bash
# Build and start the development container
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

## Running with Docker directly

### Production Build

```bash
# Build the image
docker build -t searchbox-app .

# Run the container
docker run -p 3000:3000 -e GOOGLE_API_KEY=your_api_key_here searchbox-app
```

### Development Build

```bash
# Build the development image
docker build -f Dockerfile.dev -t searchbox-app-dev .

# Run the development container
docker run -p 3000:3000 -v $(pwd):/app -e GOOGLE_API_KEY=your_api_key_here searchbox-app-dev
```

## Stopping the Application

```bash
# Stop docker-compose services
docker-compose down

# Stop development services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (this will delete FAISS indexes)
docker-compose down -v
```

## Data Persistence

The FAISS vector store indexes are persisted using Docker volumes. This means:

- Your search indexes will survive container restarts
- Data is stored in a Docker volume named `faiss-indexes`
- To completely reset the app, use `docker-compose down -v`

## Health Checks

The production container includes a health check that verifies the application is responding. You can check the health status with:

```bash
docker-compose ps
```

## Troubleshooting

### Container won't start

- Check that your `.env` file exists and contains a valid `GOOGLE_API_KEY`
- Ensure port 3000 is not already in use
- Check Docker logs: `docker-compose logs searchbox-app`

### Vector store not working

- Verify your Google API key is correct and has the necessary permissions
- Check the **rate LIMIT** on your key
- Check the container logs for API-related errors
- Ensure the FAISS indexes volume is properly mounted
- If you see "Could not import faiss-node" errors, the native bindings may not have compiled correctly. Try rebuilding the image with `docker build --no-cache -t searchbox-app .`

### Performance issues

- The app uses FAISS for vector storage, which requires some memory
- Consider increasing Docker's memory allocation if you have many documents
- Monitor container resource usage with `docker stats`
