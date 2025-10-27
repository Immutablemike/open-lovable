// Database integration for local model performance tracking
// Simple implementation using node:fs for basic tracking

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

export interface ModelStats {
  total_attempts: number;
  success_rate: number;
  avg_generation_time_ms: number;
  avg_code_size_bytes: number;
  last_used?: string;
}

class SimpleFileDatabase {
  private dataDir: string;
  private websitesFile: string;
  private attemptsFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.websitesFile = path.join(this.dataDir, 'websites.json');
    this.attemptsFile = path.join(this.dataDir, 'clone_attempts.json');
    this.ensureDataDirectory();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Initialize files if they don't exist
    if (!fs.existsSync(this.websitesFile)) {
      fs.writeFileSync(this.websitesFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.attemptsFile)) {
      fs.writeFileSync(this.attemptsFile, JSON.stringify([], null, 2));
    }
  }

  private readWebsites(): Website[] {
    try {
      const data = fs.readFileSync(this.websitesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading websites file:', error);
      return [];
    }
  }

  private writeWebsites(websites: Website[]) {
    try {
      fs.writeFileSync(this.websitesFile, JSON.stringify(websites, null, 2));
    } catch (error) {
      console.error('Error writing websites file:', error);
    }
  }

  private readAttempts(): CloneAttempt[] {
    try {
      const data = fs.readFileSync(this.attemptsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading attempts file:', error);
      return [];
    }
  }

  private writeAttempts(attempts: CloneAttempt[]) {
    try {
      fs.writeFileSync(this.attemptsFile, JSON.stringify(attempts, null, 2));
    } catch (error) {
      console.error('Error writing attempts file:', error);
    }
  }

  private getNextId(items: { id: number }[]): number {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  }

  // Website operations
  async saveWebsite(website: Omit<Website, 'id'>): Promise<number> {
    const websites = this.readWebsites();
    const newWebsite: Website = {
      ...website,
      id: this.getNextId(websites)
    };
    
    websites.push(newWebsite);
    this.writeWebsites(websites);
    
    return newWebsite.id;
  }

  async getWebsiteByUrl(url: string): Promise<Website | null> {
    const websites = this.readWebsites();
    return websites.find(w => w.url === url) || null;
  }

  async getAllWebsites(): Promise<Website[]> {
    return this.readWebsites().sort((a, b) => 
      new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime()
    );
  }

  // Clone attempt operations
  async saveCloneAttempt(attempt: Omit<CloneAttempt, 'id'>): Promise<number> {
    const attempts = this.readAttempts();
    const newAttempt: CloneAttempt = {
      ...attempt,
      id: this.getNextId(attempts),
      code_size_bytes: attempt.generated_code?.length || 0,
      component_count: (attempt.generated_code?.match(/export default function/g) || []).length
    };
    
    attempts.push(newAttempt);
    this.writeAttempts(attempts);
    
    return newAttempt.id;
  }

  async getCloneAttemptsByWebsite(websiteId: number): Promise<CloneAttempt[]> {
    const attempts = this.readAttempts();
    return attempts
      .filter(a => a.website_id === websiteId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getCloneAttemptsByModel(modelName: string): Promise<CloneAttempt[]> {
    const attempts = this.readAttempts();
    return attempts
      .filter(a => a.model_used === modelName)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Analytics operations
  async getModelStats(modelName: string): Promise<ModelStats | null> {
    const attempts = await this.getCloneAttemptsByModel(modelName);
    
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

  async getProviderComparison(): Promise<any[]> {
    const attempts = this.readAttempts();
    const providersSet = new Set(attempts.map(a => a.provider));
    const providers = Array.from(providersSet);
    
    return providers.map(provider => {
      const providerAttempts = attempts.filter(a => a.provider === provider);
      const successful = providerAttempts.filter(a => a.status === 'success');
      
      return {
        provider,
        total_attempts: providerAttempts.length,
        success_rate: (successful.length / providerAttempts.length) * 100,
        avg_generation_time: providerAttempts.reduce((sum, a) => sum + (a.generation_time_ms || 0), 0) / providerAttempts.length,
        avg_code_size: successful.reduce((sum, a) => sum + (a.code_size_bytes || 0), 0) / successful.length || 0
      };
    }).sort((a, b) => b.success_rate - a.success_rate);
  }

  async getModelPerformanceSummary(): Promise<any[]> {
    const attempts = this.readAttempts();
    const modelsSet = new Set(attempts.map(a => a.model_used));
    const models = Array.from(modelsSet);
    
    return models.map(model => {
      const modelAttempts = attempts.filter(a => a.model_used === model);
      const successful = modelAttempts.filter(a => a.status === 'success');
      
      return {
        model_name: model,
        provider: modelAttempts[0]?.provider || 'unknown',
        total_attempts: modelAttempts.length,
        success_rate: (successful.length / modelAttempts.length) * 100,
        avg_generation_time: modelAttempts.reduce((sum, a) => sum + (a.generation_time_ms || 0), 0) / modelAttempts.length,
        avg_code_size: successful.reduce((sum, a) => sum + (a.code_size_bytes || 0), 0) / successful.length || 0,
        last_used: modelAttempts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at
      };
    }).sort((a, b) => a.avg_generation_time - b.avg_generation_time);
  }

  // Export data for analysis
  async exportData(): Promise<{ websites: Website[], attempts: CloneAttempt[] }> {
    return {
      websites: this.readWebsites(),
      attempts: this.readAttempts()
    };
  }

  // Import sample data
  async importSampleData() {
    const sampleWebsites: Website[] = [
      {
        id: 1,
        url: 'https://stripe.com',
        title: 'Stripe - Online Payment Processing',
        description: 'Accept payments online',
        markdown_content: '# Stripe\n\nThe new standard in online payments\n\nStripe is a suite of payment APIs that powers commerce for online businesses of all sizes.',
        html_content: '<html><head><title>Stripe</title></head><body><h1>Stripe</h1><p>The new standard in online payments</p></body></html>',
        screenshot_url: 'https://images.unsplash.com/stripe-homepage.jpg',
        scraped_at: new Date().toISOString(),
        firecrawl_metadata: { title: "Stripe", description: "Online payments", industry: "fintech" },
        status: 'scraped'
      },
      {
        id: 2,
        url: 'https://vercel.com',
        title: 'Vercel - Develop. Preview. Ship.',
        description: 'Frontend cloud platform',
        markdown_content: '# Vercel\n\nDevelop. Preview. Ship.\n\nVercel is the platform for frontend developers.',
        html_content: '<html><head><title>Vercel</title></head><body><nav><h1>Vercel</h1></nav><main><h2>Develop. Preview. Ship.</h2></main></body></html>',
        screenshot_url: 'https://images.unsplash.com/vercel-homepage.jpg',
        scraped_at: new Date().toISOString(),
        firecrawl_metadata: { title: "Vercel", description: "Frontend cloud", industry: "developer-tools" },
        status: 'scraped'
      }
    ];

    const sampleAttempts: CloneAttempt[] = [
      {
        id: 1,
        website_id: 1,
        model_used: 'ollama/llama3.2:7b',
        provider: 'ollama',
        style_selected: 'glassmorphism',
        additional_instructions: 'Make it look modern with payment focused design',
        generated_code: 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">\n      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-2xl p-8 m-8">\n        <h1 className="text-4xl font-bold text-gray-900 mb-4">Stripe</h1>\n        <p className="text-xl text-gray-700">The new standard in online payments</p>\n        <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg">Get Started</button>\n      </div>\n    </div>\n  );\n}',
        sandbox_url: 'http://localhost:3000/stripe-clone-1',
        created_at: new Date().toISOString(),
        status: 'success',
        generation_time_ms: 3500,
        code_size_bytes: 0,
        component_count: 0
      },
      {
        id: 2,
        website_id: 2,
        model_used: 'vllm/meta-llama/CodeLlama-7b-Instruct-hf',
        provider: 'vllm',
        style_selected: 'minimalist',
        generated_code: 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-white">\n      <header className="border-b border-gray-200 px-8 py-4">\n        <h1 className="text-2xl font-semibold">Vercel</h1>\n      </header>\n      <main className="px-8 py-16">\n        <h2 className="text-5xl font-bold mb-4">Develop. Preview. Ship.</h2>\n        <p className="text-xl text-gray-600">Frontend cloud platform</p>\n      </main>\n    </div>\n  );\n}',
        sandbox_url: 'http://localhost:3000/vercel-clone-1',
        created_at: new Date().toISOString(),
        status: 'success',
        generation_time_ms: 2800,
        code_size_bytes: 0,
        component_count: 0
      }
    ];

    this.writeWebsites(sampleWebsites);
    this.writeAttempts(sampleAttempts);
    
    console.log('Sample data imported successfully');
  }
}

// Singleton instance
const dbManager = new SimpleFileDatabase();

export default dbManager;

// Helper functions for common operations
export async function trackWebsiteClone(
  url: string, 
  modelUsed: string, 
  generatedCode: string, 
  generationTimeMs: number,
  status: 'success' | 'error' = 'success',
  errorMessage?: string
): Promise<number> {
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
    generation_time_ms: generationTimeMs
  });
  
  return attemptId;
}

export async function getModelStats(modelName: string): Promise<ModelStats | null> {
  return dbManager.getModelStats(modelName);
}

export async function initializeSampleData() {
  await dbManager.importSampleData();
}

export { dbManager };