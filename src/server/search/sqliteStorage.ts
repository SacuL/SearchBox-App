import Database from 'better-sqlite3';
import { SearchableDocument } from './types';
import { SearchStorageInterface } from './storageInterface';
import path from 'path';

export class SQLiteSearchStorage implements SearchStorageInterface {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath?: string) {
    // Use provided path or default to project root
    this.dbPath = dbPath || path.join(process.cwd(), 'search-index.db');
    this.db = new Database(this.dbPath);
    this.initializeDatabase();
  }

  /**
   * Initialize the database schema
   */
  private initializeDatabase(): void {
    // Create documents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_extension TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        upload_date INTEGER NOT NULL,
        file_size INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Create index for better search performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_documents_content 
      ON documents(content)
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_documents_file_extension 
      ON documents(file_extension)
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_documents_upload_date 
      ON documents(upload_date)
    `);

    console.log('🗄️ SQLite search storage initialized');
  }

  /**
   * Add a document to the storage
   */
  addDocument(doc: SearchableDocument, content: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO documents 
      (id, file_name, original_name, file_extension, mime_type, upload_date, file_size, content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      doc.id,
      doc.fileName,
      doc.originalName,
      doc.fileExtension,
      doc.mimeType,
      doc.uploadDate.getTime(),
      doc.fileSize,
      content,
    );

    console.log(`🗄️ Stored document in SQLite: ${doc.fileName} (${doc.id})`);
  }

  /**
   * Update a document in the storage
   */
  updateDocument(doc: SearchableDocument, content: string): void {
    this.addDocument(doc, content); // INSERT OR REPLACE handles updates
    console.log(`🔄 Updated document in SQLite: ${doc.fileName} (${doc.id})`);
  }

  /**
   * Remove a document from the storage
   */
  removeDocument(id: string): void {
    const stmt = this.db.prepare('DELETE FROM documents WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes > 0) {
      console.log(`🗑️ Removed document from SQLite: ${id}`);
    } else {
      console.log(`⚠️ Document not found in SQLite: ${id}`);
    }
  }

  /**
   * Get a document by ID
   */
  getDocument(id: string): SearchableDocument | null {
    const stmt = this.db.prepare(`
      SELECT id, file_name, original_name, file_extension, mime_type, upload_date, file_size
      FROM documents WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      fileName: row.file_name,
      originalName: row.original_name,
      fileExtension: row.file_extension,
      mimeType: row.mime_type,
      uploadDate: new Date(row.upload_date),
      fileSize: row.file_size,
    };
  }

  /**
   * Get all documents
   */
  getAllDocuments(): SearchableDocument[] {
    const stmt = this.db.prepare(`
      SELECT id, file_name, original_name, file_extension, mime_type, upload_date, file_size
      FROM documents ORDER BY upload_date DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map((row) => ({
      id: row.id,
      fileName: row.file_name,
      originalName: row.original_name,
      fileExtension: row.file_extension,
      mimeType: row.mime_type,
      uploadDate: new Date(row.upload_date),
      fileSize: row.file_size,
    }));
  }

  /**
   * Search documents using SQLite FTS (Full Text Search)
   */
  searchDocuments(
    query: string,
    options: {
      limit?: number;
      offset?: number;
      fileTypes?: string[];
    } = {},
  ): { documents: SearchableDocument[]; total: number } {
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    // Build the WHERE clause
    let whereClause = 'WHERE documents MATCH ?';
    const params: any[] = [query];

    if (options.fileTypes && options.fileTypes.length > 0) {
      const fileTypePlaceholders = options.fileTypes.map(() => '?').join(',');
      whereClause += ` AND file_extension IN (${fileTypePlaceholders})`;
      params.push(...options.fileTypes);
    }

    // Get total count
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM documents
      ${whereClause}
    `);
    const total = (countStmt.get(...params) as any).total;

    // Get paginated results
    const searchStmt = this.db.prepare(`
      SELECT id, file_name, original_name, file_extension, mime_type, upload_date, file_size,
             rank
      FROM (
        SELECT id, file_name, original_name, file_extension, mime_type, upload_date, file_size,
               rank() OVER (ORDER BY rank) as rank
        FROM documents
        ${whereClause}
        ORDER BY rank
        LIMIT ? OFFSET ?
      )
    `);

    const rows = searchStmt.all(...params, limit, offset) as any[];
    const documents = rows.map((row) => ({
      id: row.id,
      fileName: row.file_name,
      originalName: row.original_name,
      fileExtension: row.file_extension,
      mimeType: row.mime_type,
      uploadDate: new Date(row.upload_date),
      fileSize: row.file_size,
    }));

    return { documents, total };
  }

  /**
   * Get document count
   */
  getDocumentCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM documents');
    const result = stmt.get() as any;
    return result.count;
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.db.exec('DELETE FROM documents');
    console.log('🧹 Cleared all documents from SQLite storage');
  }

  /**
   * Get storage statistics
   */
  getStats(): { documentCount: number; dbSize: number } {
    const documentCount = this.getDocumentCount();

    // Get database file size
    const fs = require('fs');
    let dbSize = 0;
    try {
      const stats = fs.statSync(this.dbPath);
      dbSize = stats.size;
    } catch (error) {
      console.warn('Could not get database file size:', error);
    }

    return { documentCount, dbSize };
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
    console.log('🔒 SQLite search storage connection closed');
  }

  /**
   * Get the database path
   */
  getDbPath(): string {
    return this.dbPath;
  }
}
