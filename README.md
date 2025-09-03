# SearchBox App

Upload and search the contents of your files!

## Requirements

The goal of the app is to provide the best possible experience for uploading files and searching for content inside them.

To provide the best experience to the user, we aim for simplicity and ease of use. On the frontend, we choose established UX patterns like drag and drop, instant feedback, and clear messages. On the backend we focus on the performance of the file indexing process, tuning its parameters to achieve a good balance between speed and search quality.

## Functional Requirements

### File Upload

1. File upload using drag and drop.
2. File upload using "upload" button.
3. Enable selection (or dragging) of multiple files to upload.
4. Support upload queuing: multiple files can be selected for upload. The frontend accepts multiple files simultaneously but uploads them sequentially. If an upload has not finished, the user can still add more files, which are enqueued and uploaded normally.
5. Provide instant upload feedback: show live progress.
6. Upload error handling: provide clear error messages and a "try again" option.
7. Accept files with the same name: like Dropbox, files are saved using a unique ID that does not collide, so multiple files with the same name are supported.
8. Supported file formats: txt, md, docx and pdf.
   1. docx will require a library (e.g., `mammoth.js`)
   2. pdfs can be complex to parse. Parsing pdfs to extract text directly is an option but cannot handle images or scanned pdfs containing text. The alternatives are OCR or LLMs. For the PoC, we will use a basic text-parsing library (e.g., `pdf-parse` or `pdf.js`) and implement LLM parsing if time allows.
9. Perform file validation before uploading: check format and size.

### File handling - storage

1. Persist uploaded files content
2. Persist uploaded files metadata (file name, file id, path)

By storing files and metadata locally or in memory, we can quickly have a working solution that requires minimal configuration and integration. Adding a layer of abstraction on these storage systems, we can easily replace them later with proper cloud storage.

### Search

Search is the main feature of the App. I believe the best possible experience includes features like suggestions, fuzzy search, match highlighting (showing where in the file the term appears), semantic search, pagination (or infinite scroll), and filtering (by file name, type, or date).
However, each of those features comes with trade-offs, such as increased system complexity, storage needs (e.g., index size), and processing power, in addition to the time required to actually implement them.
We must carefully consider each feature in relation to its cost. After deciding on the underlying technology, we can revisit these requirements to reevaluate which features to keep, discard, or add. Initially, we selected the following set of desired features:

1. Search filters by file name and type
2. Fuzzy search: for simplicity, we will leverage fuzzy search from the chosen search index library (e.g., `FlexSearch`) or plug in a lightweight library (e.g., `Lunr`).
3. Pagination

### File management

The app must also enable basic management of uploaded files.

1. List files
2. Filter files by name or format
3. Download files
4. Delete files

## Non-functional

For non-functional requirements, we focus on aspects we consider important for providing the best user experience. We also consider how the project is built to support future growth in functionality and complexity.

1. Search feels fast: search results returned in < 1s.
2. The interface is minimal and without clutter to reduce cognitive overhead
3. File storage must support future swapping to another provider (e.g., from local to S3)

## Out of Scope

These items will not be included in this PoC due to time constraints and prioritization, but they also serve as suggestions for how the app can be improved.

1. Authentication and user isolation
2. Upload from 3rd parties: Google Drive, Dropbox, etc
3. Semantic search using vectors
4. Production-grade persistent storage (e.g., cloud databases)
5. Responsive layout for mobile users
6. OCR/LLM parsing of files.
7. There are many file types we could support. To name a few: rtf, ebooks (epub, mobi, etc), presentation (ppt, pptx), spreadsheets (xls, xlsx), OpenDocument formats (odt, odp, ods)
8. Support for archives (zip, tar, rar, 7z): unpack and parse all files archived.

## Technical Approach

For the PoC, the implementation will be done using `Next.js` with `React`, combined with `trpc`, which provides a live TypeScript type check on Front and Backend. Files will be stored locally on disk and their metadata in memory. Search will be handled by `FlexSearch`. Parsing of Docx files will be done by `mammoth.js` and text-based pdf content extraction by `pdf-parse`.
