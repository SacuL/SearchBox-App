# Storage System

This directory contains the modular storage system for the SearchBox application.

## Architecture

The storage system is designed with a modular interface that allows for easy swapping between different storage backends (local disk, S3, etc.).

### Components

- **`types.ts`** - TypeScript interfaces and types for the storage system
- **`localStorage.ts`** - Local disk storage implementation
- **`index.ts`** - Storage factory and exports
- **`init.ts`** - Storage initialization utilities

## Storage Interface

The `StorageInterface` provides the following methods:

- `saveFile()` - Save a file to storage
- `getFile()` - Retrieve a file from storage
- `deleteFile()` - Delete a file from storage
- `fileExists()` - Check if a file exists
- `getFileMetadata()` - Get file metadata
- `listFiles()` - List all files

## Local Storage Implementation

The `LocalStorage` class implements the storage interface using the local filesystem:

- Files are stored in the `uploads/` directory
- Subdirectories are created based on file extensions
- Metadata is stored in `uploads/metadata.json`
- Unique file names are generated to prevent conflicts
- SHA-256 checksums are calculated for integrity

## File Organization

```
uploads/
├── metadata.json          # File metadata index
├── txt/                   # Text files
├── pdf/                   # PDF files
├── docx/                  # Word documents
└── md/                    # Markdown files
```

## Usage

### Basic Usage

```typescript
import { StorageFactory } from './storage';

// Get storage instance
const storage = await StorageFactory.getStorage('local', { uploadsDir: 'uploads' });

// Save a file
const result = await storage.saveFile(fileBuffer, 'document.pdf', 'application/pdf');

// Get file metadata
const metadata = await storage.getFileMetadata(result.fileId);

// Download a file
const fileBuffer = await storage.getFile(result.fileId);
```

### API Endpoints

- `POST /api/upload` - Upload a file
- `GET /api/download/[fileId]` - Download a file
- tRPC endpoints for file management (list, delete, metadata)

## Future Extensions

The modular design allows for easy addition of other storage backends:

- AWS S3 storage
- Google Cloud Storage
- Azure Blob Storage
- Database storage

Simply implement the `StorageInterface` and add it to the `StorageFactory`.
