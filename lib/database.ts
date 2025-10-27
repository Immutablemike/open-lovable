// Database integration for local model performance tracking
import * as Database from 'better-sqlite3';
import * as duckdb from 'duckdb';
import * as path from 'path';
import * as fs from 'fs';

// Types for our database models
export interface Website {
  id: number;
  url: string;
  title: string;
  description?: string;
  markdown_content?: string;
  html_content?: string;
  screenshot_url?: string;
  scraped_at: string;
  firecrawl_metadata?: any;
  status: string;
}

export interface CloneAttempt {
  id: number;
  website_id: number;
  model_used: string;
  provider: string;
  style_selected?: string;
  additional_instructions?: string;
  generated_code?: string;
  sandbox_url?: string;
  created_at: string;
  status: string;
  error_message?: string;
  generation_time_ms?: number;
  code_size_bytes?: number;
  component_count?: number;
}

export interface ModelBenchmark {
  id: number;
  model_name: string;
  provider: string;
  model_size?: string;
  hardware_specs?: any;
  website_complexity: string;
  avg_generation_time_ms: number;
  avg_code_quality_score: number;
  success_rate: number;
  avg_user_satisfaction: number;
  total_attempts: number;
  benchmark_date: string;
  notes?: string;
}

class DatabaseManager {
  private sqliteDb: Database.default | null = null;
  private duckDbConnection: duckdb.Connection | null = null;
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.ensureDataDirectory();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // SQLite connection for transactional operations
  getSQLiteConnection(): Database.default {
    if (!this.sqliteDb) {
      const dbPath = path.join(this.dataDir, 'open_lovable.db');
      this.sqliteDb = new (Database.default as any)(dbPath);
      this.initializeSQLite();
    }
    return this.sqliteDb;
  }

  // DuckDB connection for analytics
  async getDuckDBConnection(): Promise<duckdb.Connection> {
    if (!this.duckDbConnection) {
      const db = new duckdb.Database(path.join(this.dataDir, 'open_lovable_analytics.duckdb'));
      this.duckDbConnection = db.connect();
      await this.initializeDuckDB();
    }
    return this.duckDbConnection;
  }

  private initializeSQLite() {
    if (!this.sqliteDb) return;

    const schemaPath = path.join(this.dataDir, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.sqliteDb.exec(schema);
    }
  }

  private async initializeDuckDB() {
    if (!this.duckDbConnection) return;

    const schemaPath = path.join(this.dataDir, 'duckdb_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      // Split and execute each statement separately for DuckDB
      const statements = schema.split(';').filter((stmt: string) => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await new Promise<void>((resolve, reject) => {
            this.duckDbConnection!.run(statement, (err: any) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }
    }
  }

  // Website operations
  async saveWebsite(website: Omit<Website, 'id'>): Promise<number> {
    const db = this.getSQLiteConnection();
    const stmt = db.prepare(`
      INSERT INTO websites (url, title, description, markdown_content, html_content, screenshot_url, scraped_at, firecrawl_metadata, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      website.url,
      website.title,
      website.description,
      website.markdown_content,
      website.html_content,
      website.screenshot_url,
      website.scraped_at,
      JSON.stringify(website.firecrawl_metadata),
      website.status
    );
    
    return result.lastInsertRowid as number;
  }

  async getWebsiteByUrl(url: string): Promise<Website | null> {
    const db = this.getSQLiteConnection();
    const stmt = db.prepare('SELECT * FROM websites WHERE url = ?');
    const result = stmt.get(url) as Website | undefined;
    
    if (result && result.firecrawl_metadata) {
      result.firecrawl_metadata = JSON.parse(result.firecrawl_metadata as string);
    }
    
    return result || null;
  }

  async getAllWebsites(): Promise<Website[]> {
    const db = this.getSQLiteConnection();
    const stmt = db.prepare('SELECT * FROM websites ORDER BY scraped_at DESC');
    const results = stmt.all() as Website[];
    
    return results.map(website => ({
      ...website,
      firecrawl_metadata: website.firecrawl_metadata ? JSON.parse(website.firecrawl_metadata as string) : null
    }));
  }

  // Clone attempt operations
  async saveCloneAttempt(attempt: Omit<CloneAttempt, 'id'>): Promise<number> {
    const db = this.getSQLiteConnection();
    const stmt = db.prepare(`
      INSERT INTO clone_attempts (website_id, model_used, provider, style_selected, additional_instructions, 
                                generated_code, sandbox_url, created_at, status, error_message, generation_time_ms, component_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      attempt.website_id,
      attempt.model_used,
      attempt.provider,
      attempt.style_selected,
      attempt.additional_instructions,
      attempt.generated_code,
      attempt.sandbox_url,
      attempt.created_at,
      attempt.status,
      attempt.error_message,
      attempt.generation_time_ms,
      attempt.component_count
    );
    
    return result.lastInsertRowid as number;
  }

  async getCloneAttemptsByWebsite(websiteId: number): Promise<CloneAttempt[]> {
    const db = this.getSQLiteConnection();
    const stmt = db.prepare('SELECT * FROM clone_attempts WHERE website_id = ? ORDER BY created_at DESC');
    return stmt.all(websiteId) as CloneAttempt[];
  }

  async getCloneAttemptsByModel(modelName: string): Promise<CloneAttempt[]> {
    const db = this.getSQLiteConnection();
    const stmt = db.prepare('SELECT * FROM clone_attempts WHERE model_used = ? ORDER BY created_at DESC');
    return stmt.all(modelName) as CloneAttempt[];
  }

  // Analytics operations using DuckDB
  async getModelPerformanceSummary(): Promise<any[]> {
    const connection = await this.getDuckDBConnection();
    
    return new Promise((resolve, reject) => {
      connection.all('SELECT * FROM model_performance_summary', (err: any, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getWebsiteComplexityAnalysis(): Promise<any[]> {
    const connection = await this.getDuckDBConnection();
    
    return new Promise((resolve, reject) => {
      connection.all('SELECT * FROM website_complexity_analysis', (err: any, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getProviderComparison(): Promise<any[]> {
    const connection = await this.getDuckDBConnection();
    
    const query = `
      SELECT 
        provider,
        COUNT(*) as total_attempts,
        AVG(generation_time_ms) as avg_generation_time,
        COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*) as success_rate,
        AVG(code_size_bytes) as avg_code_size
      FROM clone_attempts 
      GROUP BY provider
      ORDER BY success_rate DESC
    `;
    
    return new Promise((resolve, reject) => {
      connection.all(query, (err: any, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async recordModelBenchmark(benchmark: Omit<ModelBenchmark, 'id'>): Promise<number> {
    const db = this.getSQLiteConnection();
    const stmt = db.prepare(`
      INSERT INTO model_benchmarks (model_name, provider, model_size, hardware_specs, website_complexity,
                                   avg_generation_time_ms, avg_code_quality_score, success_rate, 
                                   avg_user_satisfaction, total_attempts, benchmark_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      benchmark.model_name,
      benchmark.provider,
      benchmark.model_size,
      JSON.stringify(benchmark.hardware_specs),
      benchmark.website_complexity,
      benchmark.avg_generation_time_ms,
      benchmark.avg_code_quality_score,
      benchmark.success_rate,
      benchmark.avg_user_satisfaction,
      benchmark.total_attempts,
      benchmark.benchmark_date,
      benchmark.notes
    );
    
    return result.lastInsertRowid as number;
  }

  // Utility methods
  async syncToAnalytics() {
    // Sync SQLite data to DuckDB for analytics
    const db = this.getSQLiteConnection();
    const connection = await this.getDuckDBConnection();
    
    // Get recent data from SQLite
    const websites = db.prepare('SELECT * FROM websites WHERE scraped_at > datetime("now", "-7 days")').all() as any[];
    const attempts = db.prepare('SELECT * FROM clone_attempts WHERE created_at > datetime("now", "-7 days")').all() as any[];
    
    // Insert into DuckDB for analytics
    for (const website of websites) {
      await new Promise<void>((resolve, reject) => {
        connection.run(`
          INSERT OR REPLACE INTO websites VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          website.id, website.url, website.title, website.description,
          website.markdown_content, website.html_content, website.screenshot_url,
          website.scraped_at, website.firecrawl_metadata, website.status
        ], (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    for (const attempt of attempts) {
      await new Promise<void>((resolve, reject) => {
        connection.run(`
          INSERT OR REPLACE INTO clone_attempts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          attempt.id, attempt.website_id, attempt.model_used, attempt.provider,
          attempt.style_selected, attempt.additional_instructions, attempt.generated_code,
          attempt.sandbox_url, attempt.created_at, attempt.status, attempt.error_message,
          attempt.generation_time_ms, attempt.component_count
        ], (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  close() {
    if (this.sqliteDb) {
      this.sqliteDb.close();
      this.sqliteDb = null;
    }
    if (this.duckDbConnection) {
      this.duckDbConnection.close();
      this.duckDbConnection = null;
    }
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

export default dbManager;

// Helper functions for common operations
export async function trackWebsiteClone(
  url: string, 
  modelUsed: string, 
  generatedCode: string, 
  generationTimeMs: number,
  status: 'success' | 'error' = 'success',
  errorMessage?: string
) {
  // Get or create website
  let website = await dbManager.getWebsiteByUrl(url);
  
  if (!website) {
    // This would typically be populated by Firecrawl scraping
    const websiteId = await dbManager.saveWebsite({
      url,
      title: `Website: ${url}`,
      description: 'Scraped for cloning',
      scraped_at: new Date().toISOString(),
      status: 'scraped'
    });
    website = { id: websiteId } as Website;
  }
  
  // Extract provider from model name
  const provider = modelUsed.includes('/') ? modelUsed.split('/')[0] : 'unknown';
  
  // Save clone attempt
  const attemptId = await dbManager.saveCloneAttempt({
    website_id: website.id,
    model_used: modelUsed,
    provider,
    generated_code: generatedCode,
    created_at: new Date().toISOString(),
    status,
    error_message: errorMessage,
    generation_time_ms: generationTimeMs,
    code_size_bytes: generatedCode?.length || 0,
    component_count: (generatedCode?.match(/export default function/g) || []).length
  });
  
  return attemptId;
}

export async function getModelStats(modelName: string) {
  const attempts = await dbManager.getCloneAttemptsByModel(modelName);
  
  if (attempts.length === 0) {
    return null;
  }
  
  const successful = attempts.filter(a => a.status === 'success');
  const avgTime = attempts.reduce((sum, a) => sum + (a.generation_time_ms || 0), 0) / attempts.length;
  const avgCodeSize = successful.reduce((sum, a) => sum + (a.code_size_bytes || 0), 0) / successful.length;
  
  return {
    total_attempts: attempts.length,
    success_rate: (successful.length / attempts.length) * 100,
    avg_generation_time_ms: avgTime,
    avg_code_size_bytes: avgCodeSize,
    last_used: attempts[0]?.created_at
  };
}