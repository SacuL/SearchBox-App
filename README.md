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
9. Enable support for encodings other than UTF-8

## Technical Approach

For the PoC, the implementation will be done using `Next.js` with `React`, combined with `trpc`, which provides a live TypeScript type check on Front and Backend. Files and their metadata will be stored in memory. Search will be handled by `FlexSearch`. Parsing of Docx files will be done by `mammoth.js` and text-based pdf content extraction by `pdf-parse`.

## The First version

The first version of this PoC has been built to enable upload and search of documents. Everything is stored in memory: the files, the search index, and the files metadata.
Storage can be easily replaced later with proper storage solutions.

The search supports fuzzy search using "full" [tokenizer](https://github.com/nextapps-de/flexsearch?tab=readme-ov-file#tokenizer-partial-match). For example, if the word `computer` was indexed, searching for `comp`, `uter`, `put`, or `computer` will all match.

## Next steps

For SearchBox to launch as a MVP it needs a few improvements. Currently, each instance of the app serves a single user, there is no authentication or persistent storage. The app needs to control user access and properly isolate user data.

## Bonus!

To improve the search functionality, we want to add semantic search using vectors. Although initially out-of-scope, I consider it a good opportunity to demonstrate the use of AI.
A popular approach to semantic search is to use a pre trained model to embed the text into a vector space where vectors represent the meaning of the text based on their position in the space. By building an index of the extracted embedding we can then perform vector searches using algorithms for nearest neighbor search.

In this project we will use [Google Gemini](https://ai.google.dev/gemini-api/docs/embeddings) to generate the embeddings from the uploaded documents and [FAISS library](https://arxiv.org/abs/2401.08281) to perform the vector search.

Additionally, building a vector search index is the first step in developing a Retrieval-Augmented Generation (RAG) solution, enabling contextually relevant document querying. By using the created index, we can build a system that retrieves the most relevant document chunks based on semantic similarity to a user’s query. In the RAG pipeline, these retrieved chunks serve as context for a large language model (LLM). For example, if a user uploads company policy documents outlining HR and IT guidelines, they could ask questions like, "What are the reimbursement rules for home office internet expenses?". The LLM then generates precise, context-aware responses by combining the retrieved document content with its generative capabilities, delivering answers based in the uploaded documents.
For this POC, however, implementing the complete RAG solution is out of scope, and we will focus on building and testing the semantic search component to validate its effectiveness.

### Building the vector search

To build the vector search we will use [langchain](https://docs.langchain.com/oss/javascript/langchain/knowledge-base). To process the uploaded documents and create a searchable index we will follow these steps:

1. Load documents using document loaders
2. Split the document's texts into chunks using text splitters
3. Load the chunks into a vector store

The vector store can then be used to answer user queries.

- Load documents using [langchain directory loaders](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/directory) and assigning the loaders we need:
  - [pdf loader](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/pdf)
  - [docx loader](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/docx)
  - [text loader](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/text), for txt and md files
