export interface SearchableDocument {
  id: string;
  fileName: string;
  originalName: string;
  fileExtension: string;
  mimeType: string;
  uploadDate: Date;
  fileSize: number;
}

export interface SearchResult {
  id: string;
  fileName: string;
  originalName: string;
  fileExtension: string;
  mimeType: string;
  uploadDate: Date;
  fileSize: number;
  score?: number;
  highlights?: string[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  includeContent?: boolean;
  fileTypes?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took: number; // milliseconds
}
