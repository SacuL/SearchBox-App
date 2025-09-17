# SearchBox App

Upload and search the contents of your files!

## Demo

On the below example, 3 files were uploaded, each one containing a specific word:

- Txt: `car`
- Docx: `automobile`
- Pdf: `vehicle`

<p align="center" style="display: flex; align-items: flex-start; justify-content: center;">
  <img alt="SearchBox App example video" title="SearchBox App example video" src="./searchbox-example.gif">
</p>

The search for any of these words matches all 3 files, as they are close semantically. Searching for an unrelated term, like banana, returns nothing.

## Requirements

The goal of the app is to provide the best possible experience for uploading files and searching for content inside them.

To provide the best experience to the user, the aim is for simplicity and ease of use. On the frontend, established UX patterns like drag and drop, instant feedback, and clear messages are chosen. On the backend, the focus is on the performance of the file indexing process, tuning its parameters to achieve a good balance between speed and search quality.

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
   2. pdfs can be complex to parse. Parsing pdfs to extract text directly is an option but cannot handle images or scanned pdfs containing text. The alternatives are OCR or LLMs. For the PoC, a basic text-parsing library (e.g., `pdf-parse` or `pdf.js`) will be used, and LLM parsing only if time allows.
9. Perform file validation before uploading: check format and size.

### File handling - storage

1. Persist uploaded files content
2. Persist uploaded files metadata (file name, file id, path)

By storing files and metadata locally or in memory, a working solution can be quickly built with minimal configuration and integration. Adding a layer of abstraction on these storage systems allows for easy replacement later with proper cloud storage.

### Search

Search is the main feature of the App. I believe the best possible experience includes features like suggestions, fuzzy search, match highlighting (showing where in the file the term appears), semantic search, pagination (or infinite scroll), and filtering (by file name, type, or date).
However, each of those features comes with trade-offs, such as increased system complexity, storage needs (e.g., index size), and processing power, in addition to the time required to actually implement them.

Semantic search using vectors was chosen as it is good opportunity to demonstrate the use of AI. A popular approach to semantic search involves using a pre-trained model to embed text into a vector space, where vectors represent the meaning of the text based on their position. By building an index of the extracted embeddings, vector searches can be performed using algorithms for nearest neighbor search.

### File management

The app must also enable basic management of uploaded files.

1. List files
2. Filter files by name or format
3. Download files
4. Delete files

## Non-functional

For non-functional requirements, the focus is on aspects considered important for providing the best user experience. The project is also built to support future growth in functionality and complexity.

1. Search feels fast: search results returned in < 1s.
2. The interface is minimal and without clutter to reduce cognitive overhead
3. File storage must support future swapping to another provider (e.g., from local to S3)

## Out of Scope

These items will not be included in this PoC due to time constraints and prioritization, but they also serve as suggestions for how the app can be improved.

1. Authentication and user isolation
2. Upload from 3rd parties: Google Drive, Dropbox, etc
3. Production-grade persistent storage (e.g., cloud databases)
4. Responsive layout for mobile users
5. OCR/LLM parsing of files.
6. There are many file types that could be supported. To name a few: rtf, ebooks (epub, mobi, etc), presentation (ppt, pptx), spreadsheets (xls, xlsx), OpenDocument formats (odt, odp, ods)
7. Support for archives (zip, tar, rar, 7z): unpack and parse all files archived.
8. Enable support for encodings other than UTF-8

## Technical Approach

For the PoC, the implementation uses `Next.js` with `React`, combined with `tRPC`, enabling live TypeScript type checking on both frontend and backend. Files and their metadata are stored in memory. The vector search is built using [LangChain](https://docs.langchain.com/oss/javascript/langchain/knowledge-base).
Search is handled by [FAISS](https://arxiv.org/abs/2401.08281) with Google Generative AI [embeddings](https://js.langchain.com/docs/integrations/text_embedding/google_generativeai/) for semantic search. Parsing of Docx files is handled by [mammoth.js](https://github.com/mwilliamson/mammoth.js) and text-based pdf content extraction by [pdf-parse](https://gitlab.com/autokent/pdf-parse).

### AI assisted coding

To get the best of AI coding assistants, it is a good practice to "guide" them to solve one small task at a time. Each task should be small enough to be implemented by creating/modifying only a couple of files, and having enough guards and restrictions to not hallucinate. However, the AI also need to have the context of the whole application that should be built. To give them enough context to start developing I described the initial planned version on a file that was fed as context to the model. Its content was basically a more detailed version of what is described on this Readme. Later, as the project evolved, and the code itself was enough context for the AI, this file was replaced by this Readme.

This project was built with [Cursor](https://cursor.com/), and 4 cursor rules files were created to guide the agents. Some rules apply to the whole project while others are specific to some folders. This segregation also helps to keep the model context smaller.

- [backend-rules.mdc](.cursor/backend-rules.mdc): includes rules for TypeScript, Next.js, and tRPC
- [frontend-rules.mdc](.cursor/frontend-rules.mdc): rules for HTML, CSS, Tailwind, and React
- [testing-rules.mdc](.cursor/testing-rules.mdc): apply to any file inside playwright folder or files ending in `.test.ts`.
- [rules.mdc](.cursor/rules.mdc): apply to the role project and includes software development rules

## Project tasks breakdown

The development tasks were created on GitHub Projects, which automatically creates the issues on the GitHub repo. The Projects page has a view with columns like a KanBan board, where task's progress is tracked. See SearchBox Project [here](https://github.com/users/SacuL/projects/3/views/1).

## The First version

The first version of this PoC has been built to enable upload and search of documents. All files are stored in memory. The FAISS index is stored in memory but a copy is kept in a file to allow quicker rebuilding.
Storage can be easily replaced later with proper storage solutions.

The search supports semantic search using FAISS vector store with Google Generative AI embeddings. This allows for finding documents based on meaning and context, not just exact text matches.

## Running the App

### Docker (recommended)

See [DOCKER.md](DOCKER.md) file for instructions.

### Locally

Make sure the .env file has the `GOOGLE_API_KEY` set. Get a free one [here](https://aistudio.google.com/app/apikey).

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Run dev
pnpm dev
```

## Running tests

```bash
# unit
pnpm test-unit

# integration
pnpm test-e2e
```

## Next steps

For SearchBox to launch as a MVP it needs a few improvements. Currently, each instance of the app serves a single user, there is no authentication or persistent storage. The app needs to control user access and properly isolate user data.

Also, some features were not fully implemented, like deletion of files or filtering by file format.

The CI pipeline is not executing the integration tests correctly. This needs further investigation.

FInally, the semantic search can also be further optimized by tunning some parameters like the threshold used when searching.
