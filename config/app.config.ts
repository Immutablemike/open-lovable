// Application Configuration
// This file contains all configurable settings for the application

export const appConfig = {
  // Vercel Sandbox Configuration
  vercelSandbox: {
    // Sandbox timeout in minutes
    timeoutMinutes: 15,

    // Convert to milliseconds for Vercel Sandbox API
    get timeoutMs() {
      return this.timeoutMinutes * 60 * 1000;
    },

    // Development server port (Vercel Sandbox typically uses 3000 for Next.js/React)
    devPort: 3000,

    // Time to wait for dev server to be ready (in milliseconds)
    devServerStartupDelay: 7000,

    // Time to wait for CSS rebuild (in milliseconds)
    cssRebuildDelay: 2000,

    // Working directory in sandbox
    workingDirectory: '/app',

    // Default runtime for sandbox
    runtime: 'node22' // Available: node22, python3.13, v0-next-shadcn, cua-ubuntu-xfce
  },

  // E2B Sandbox Configuration
  e2b: {
    // Sandbox timeout in minutes
    timeoutMinutes: 30,

    // Convert to milliseconds for E2B API
    get timeoutMs() {
      return this.timeoutMinutes * 60 * 1000;
    },

    // Development server port (E2B uses 5173 for Vite)
    vitePort: 5173,

    // Time to wait for Vite dev server to be ready (in milliseconds)
    viteStartupDelay: 10000,

    // Working directory in sandbox
    workingDirectory: '/home/user/app',
  },
  
  // AI Model Configuration
  ai: {
    // Default AI model
    defaultModel: 'moonshotai/kimi-k2-instruct-0905',
    
    // Available models
    availableModels: [
      'openai/gpt-5',
      'moonshotai/kimi-k2-instruct-0905',
      'anthropic/claude-sonnet-4-20250514',
      'google/gemini-2.0-flash-exp',
      // Local models
      'ollama/llama3.2:7b',
      'ollama/deepseek-coder:6.7b',
      'ollama/codellama:7b',
      'vllm/meta-llama/CodeLlama-7b-Instruct-hf',
      'vllm/deepseek-ai/deepseek-coder-6.7b-instruct',
      'lmstudio/gpt-oss-20b',
      'lmstudio/deepseek-coder-v2-lite'
    ],
    
    // Model display names
    modelDisplayNames: {
      'openai/gpt-5': 'GPT-5',
      'moonshotai/kimi-k2-instruct-0905': 'Kimi K2 (Groq)',
      'anthropic/claude-sonnet-4-20250514': 'Sonnet 4',
      'google/gemini-2.0-flash-exp': 'Gemini 2.0 Flash (Experimental)',
      // Local model display names
      'ollama/llama3.2:7b': 'Llama 3.2 7B (Ollama)',
      'ollama/deepseek-coder:6.7b': 'DeepSeek Coder 6.7B (Ollama)',
      'ollama/codellama:7b': 'Code Llama 7B (Ollama)',
      'vllm/meta-llama/CodeLlama-7b-Instruct-hf': 'Code Llama 7B (vLLM)',
      'vllm/deepseek-ai/deepseek-coder-6.7b-instruct': 'DeepSeek Coder 6.7B (vLLM)',
      'lmstudio/gpt-oss-20b': 'GPT-OSS 20B (LM Studio)',
      'lmstudio/deepseek-coder-v2-lite': 'DeepSeek Coder V2 Lite (LM Studio)'
    } as Record<string, string>,
    
    // Model API configuration
    modelApiConfig: {
      'moonshotai/kimi-k2-instruct-0905': {
        provider: 'groq',
        model: 'moonshotai/kimi-k2-instruct-0905'
      },
      // Local model configurations
      'ollama/llama3.2:7b': {
        provider: 'ollama',
        model: 'llama3.2:7b',
        baseURL: 'http://localhost:11434/v1'
      },
      'ollama/deepseek-coder:6.7b': {
        provider: 'ollama', 
        model: 'deepseek-coder:6.7b',
        baseURL: 'http://localhost:11434/v1'
      },
      'ollama/codellama:7b': {
        provider: 'ollama',
        model: 'codellama:7b',
        baseURL: 'http://localhost:11434/v1'
      },
      'vllm/meta-llama/CodeLlama-7b-Instruct-hf': {
        provider: 'vllm',
        model: 'meta-llama/CodeLlama-7b-Instruct-hf',
        baseURL: 'http://localhost:8000/v1'
      },
      'vllm/deepseek-ai/deepseek-coder-6.7b-instruct': {
        provider: 'vllm',
        model: 'deepseek-ai/deepseek-coder-6.7b-instruct',
        baseURL: 'http://localhost:8000/v1'
      },
      'lmstudio/gpt-oss-20b': {
        provider: 'lmstudio',
        model: 'gpt-oss-20b',
        baseURL: 'http://localhost:1234/v1'
      },
      'lmstudio/deepseek-coder-v2-lite': {
        provider: 'lmstudio',
        model: 'deepseek-coder-v2-lite',
        baseURL: 'http://localhost:1234/v1'
      }
    },
    
    // Temperature settings for non-reasoning models
    defaultTemperature: 0.7,
    
    // Max tokens for code generation
    maxTokens: 8000,
    
    // Max tokens for truncation recovery
    truncationRecoveryMaxTokens: 4000,
  },
  
  // Local AI Configuration
  localAI: {
    // Ollama configuration
    ollama: {
      enabled: false, // Set via environment variable OLLAMA_ENABLED=true
      baseURL: 'http://localhost:11434/v1', // Override with OLLAMA_BASE_URL
      // Recommended models for code generation
      recommendedModels: [
        'llama3.2:7b',
        'deepseek-coder:6.7b', 
        'codellama:7b',
        'codegemma:7b',
        'qwen2.5-coder:7b'
      ],
      // Minimum model requirements
      minimumModelSize: '3B',
      recommendedModelSize: '7B+'
    },
    
    // vLLM configuration
    vllm: {
      enabled: false, // Set via environment variable VLLM_ENABLED=true
      baseURL: 'http://localhost:8000/v1', // Override with VLLM_BASE_URL
      recommendedModels: [
        'meta-llama/CodeLlama-7b-Instruct-hf',
        'deepseek-ai/deepseek-coder-6.7b-instruct',
        'Qwen/Qwen2.5-Coder-7B-Instruct',
        'microsoft/DialoGPT-medium'
      ],
      minimumModelSize: '7B',
      recommendedModelSize: '13B+'
    },
    
    // LM Studio configuration
    lmstudio: {
      enabled: false, // Set via environment variable LMSTUDIO_ENABLED=true
      baseURL: 'http://localhost:1234/v1', // Override with LMSTUDIO_BASE_URL
      recommendedModels: [
        'gpt-oss-20b',
        'deepseek-coder-v2-lite',
        'codellama-7b-instruct',
        'qwen2.5-coder-7b-instruct'
      ],
      minimumModelSize: '3B',
      recommendedModelSize: '7B+'
    }
  },
  
  // Code Application Configuration
  codeApplication: {
    // Delay after applying code before refreshing iframe (milliseconds)
    defaultRefreshDelay: 2000,
    
    // Delay when packages are installed (milliseconds)
    packageInstallRefreshDelay: 5000,
    
    // Enable/disable automatic truncation recovery
    enableTruncationRecovery: false, // Disabled - too many false positives
    
    // Maximum number of truncation recovery attempts per file
    maxTruncationRecoveryAttempts: 1,
  },
  
  // UI Configuration
  ui: {
    // Show/hide certain UI elements
    showModelSelector: true,
    showStatusIndicator: true,
    
    // Animation durations (milliseconds)
    animationDuration: 200,
    
    // Toast notification duration (milliseconds)
    toastDuration: 3000,
    
    // Maximum chat messages to keep in memory
    maxChatMessages: 100,
    
    // Maximum recent messages to send as context
    maxRecentMessagesContext: 20,
  },
  
  // Development Configuration
  dev: {
    // Enable debug logging
    enableDebugLogging: true,
    
    // Enable performance monitoring
    enablePerformanceMonitoring: false,
    
    // Log API responses
    logApiResponses: true,
  },
  
  // Package Installation Configuration
  packages: {
    // Use --legacy-peer-deps flag for npm install
    useLegacyPeerDeps: true,
    
    // Package installation timeout (milliseconds)
    installTimeout: 60000,
    
    // Auto-restart Vite after package installation
    autoRestartVite: true,
  },
  
  // File Management Configuration
  files: {
    // Excluded file patterns (files to ignore)
    excludePatterns: [
      'node_modules/**',
      '.git/**',
      '.next/**',
      'dist/**',
      'build/**',
      '*.log',
      '.DS_Store'
    ],
    
    // Maximum file size to read (bytes)
    maxFileSize: 1024 * 1024, // 1MB
    
    // File extensions to treat as text
    textFileExtensions: [
      '.js', '.jsx', '.ts', '.tsx',
      '.css', '.scss', '.sass',
      '.html', '.xml', '.svg',
      '.json', '.yml', '.yaml',
      '.md', '.txt', '.env',
      '.gitignore', '.dockerignore'
    ],
  },
  
  // API Endpoints Configuration (for external services)
  api: {
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    
    // Request timeout (milliseconds)
    requestTimeout: 30000,
  }
};

// Type-safe config getter
export function getConfig<K extends keyof typeof appConfig>(key: K): typeof appConfig[K] {
  return appConfig[key];
}

// Helper to get nested config values
export function getConfigValue(path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], appConfig as any);
}

export default appConfig;