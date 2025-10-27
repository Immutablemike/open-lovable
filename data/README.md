# Database Integration for Local Model Testing

This directory contains database infrastructure for tracking website cloning attempts and model performance with local AI models.

## Overview

The database system supports two complementary databases:
- **SQLite**: For transactional operations (saving clone attempts, website data)
- **DuckDB**: For analytics and performance analysis

## Database Schema

### Core Tables

#### `websites`
Stores scraped website data from Firecrawl:
- Website metadata (title, description, URL)
- Content (markdown, HTML)
- Firecrawl metadata
- Screenshots and scraping status

#### `clone_attempts` 
Tracks each attempt to clone a website:
- Model used and provider
- Generated code and sandbox URL
- Performance metrics (generation time, code size)
- Success/failure status

#### `code_files`
Stores individual files generated during cloning:
- File path and content
- File type and metadata
- Lines of code analysis

#### `model_benchmarks`
Performance benchmarks for different models:
- Average generation time
- Code quality scores
- Success rates by website complexity
- Hardware specifications

## Installation

### Required Dependencies
```bash
npm install better-sqlite3 duckdb @types/better-sqlite3
```

### Database Initialization
```bash
# SQLite database will be created automatically at: data/open_lovable.db
# DuckDB analytics database at: data/open_lovable_analytics.duckdb

# Initialize with sample data:
node -e "import('./lib/database.js').then(db => db.default.initializeSQLite())"
```

## Usage Examples

### Basic Operations
```typescript
import dbManager, { trackWebsiteClone, getModelStats } from './lib/database';

// Track a website cloning attempt
const attemptId = await trackWebsiteClone(
  'https://stripe.com',
  'ollama/llama3.2:7b',
  generatedCode,
  3500, // generation time in ms
  'success'
);

// Get performance stats for a model
const stats = await getModelStats('ollama/llama3.2:7b');
console.log(stats);
// {
//   total_attempts: 25,
//   success_rate: 92.0,
//   avg_generation_time_ms: 3200,
//   avg_code_size_bytes: 2400,
//   last_used: "2024-01-15T10:30:00Z"
// }
```

### Analytics Queries
```typescript
// Get model performance comparison
const performance = await dbManager.getModelPerformanceSummary();

// Analyze website complexity vs generation time
const complexity = await dbManager.getWebsiteComplexityAnalysis();

// Compare providers
const providers = await dbManager.getProviderComparison();
```

## Integration with Open Lovable

### API Route Integration
```typescript
// In app/api/generate-ai-code-stream/route.ts
import { trackWebsiteClone } from '@/lib/database';

export async function POST(req: Request) {
  const startTime = Date.now();
  
  // ... existing generation logic ...
  
  const generationTime = Date.now() - startTime;
  
  // Track the attempt
  await trackWebsiteClone(
    websiteUrl,
    selectedModel,
    generatedCode,
    generationTime,
    success ? 'success' : 'error',
    errorMessage
  );
  
  return response;
}
```

### Performance Monitoring
```typescript
// Monitor model performance over time
const monthlyStats = await dbManager.getDuckDBConnection().then(conn => 
  new Promise((resolve, reject) => {
    conn.all(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        provider,
        AVG(generation_time_ms) as avg_time,
        COUNT(*) as attempts
      FROM clone_attempts 
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month, provider
      ORDER BY month DESC
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  })
);
```

## Analytics Views

### Model Performance Summary
```sql
SELECT 
  provider,
  model_name,
  COUNT(*) as total_attempts,
  AVG(generation_time_ms) as avg_generation_time,
  COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*) as success_rate,
  AVG(code_size_bytes) as avg_code_size
FROM clone_attempts 
GROUP BY provider, model_name
ORDER BY avg_generation_time;
```

### Website Complexity Analysis
```sql
SELECT 
  w.domain,
  w.title,
  w.word_count,
  COUNT(ca.id) as clone_attempts,
  AVG(ca.generation_time_ms) as avg_generation_time
FROM websites w
LEFT JOIN clone_attempts ca ON w.id = ca.website_id
GROUP BY w.id, w.domain, w.title, w.word_count
ORDER BY w.word_count DESC;
```

## Sample Data

The database includes sample data for testing:
- **Stripe**: Payment processing website
- **Vercel**: Frontend cloud platform  
- **Tailwind CSS**: CSS framework documentation
- **OpenAI**: AI research company

Clone attempts with different local models:
- `ollama/llama3.2:7b`
- `ollama/deepseek-coder:6.7b`
- `vllm/meta-llama/CodeLlama-7b-Instruct-hf`
- `lmstudio/gpt-oss-20b`

## Performance Benchmarks

| Model | Provider | Avg Time (ms) | Success Rate | Notes |
|-------|----------|---------------|--------------|-------|
| llama3.2:7b | ollama | 3,200 | 95% | Good balance of speed/quality |
| deepseek-coder:6.7b | ollama | 4,100 | 92% | Excellent for code generation |
| CodeLlama-7b | vllm | 2,600 | 88% | Fastest with vLLM optimization |
| gpt-oss-20b | lmstudio | 7,200 | 85% | Highest quality, slower |

## Data Sync

The system automatically syncs recent data from SQLite to DuckDB for analytics:

```typescript
// Sync data for analytics
await dbManager.syncToAnalytics();
```

## Cleanup and Maintenance

```typescript
// Close all database connections
dbManager.close();

// Clear old attempts (optional)
const db = dbManager.getSQLiteConnection();
db.exec('DELETE FROM clone_attempts WHERE created_at < datetime("now", "-30 days")');
```

## Future Enhancements

1. **Real-time Performance Monitoring**: WebSocket updates for live performance tracking
2. **A/B Testing Framework**: Compare model performance on same websites
3. **Quality Scoring**: Automated code quality assessment using AST analysis
4. **User Feedback Integration**: Track user satisfaction and preferences
5. **Cost Analysis**: Track compute costs per model/provider
6. **Export Capabilities**: Generate reports for PR submissions and research

This database system provides comprehensive tracking and analytics for local model performance, supporting the goal of contributing valuable performance data back to the Open Lovable project.