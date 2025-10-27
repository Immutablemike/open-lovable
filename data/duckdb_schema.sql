-- DuckDB-specific setup for website cloning data
-- Optimized for analytical queries and large-scale data processing

CREATE TABLE websites (
    id BIGINT PRIMARY KEY,
    url VARCHAR NOT NULL UNIQUE,
    title VARCHAR,
    description VARCHAR,
    markdown_content TEXT,
    html_content TEXT,
    screenshot_url VARCHAR,
    scraped_at TIMESTAMP DEFAULT NOW(),
    firecrawl_metadata JSON,
    status VARCHAR DEFAULT 'scraped',
    -- DuckDB-specific optimizations
    domain VARCHAR GENERATED ALWAYS AS (regexp_extract(url, '^https?://([^/]+)', 1)) STORED,
    content_length INTEGER GENERATED ALWAYS AS (length(markdown_content)) STORED,
    word_count INTEGER GENERATED ALWAYS AS (length(markdown_content) - length(replace(markdown_content, ' ', '')) + 1) STORED
);

CREATE TABLE clone_attempts (
    id BIGINT PRIMARY KEY,
    website_id BIGINT NOT NULL,
    model_used VARCHAR NOT NULL,
    provider VARCHAR NOT NULL, -- extract provider from model_used
    style_selected VARCHAR,
    additional_instructions TEXT,
    generated_code TEXT,
    sandbox_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR DEFAULT 'pending',
    error_message TEXT,
    generation_time_ms INTEGER,
    -- Performance metrics
    code_size_bytes INTEGER GENERATED ALWAYS AS (length(generated_code)) STORED,
    component_count INTEGER, -- number of React components generated
    FOREIGN KEY (website_id) REFERENCES websites (id)
);

CREATE TABLE code_files (
    id BIGINT PRIMARY KEY,
    clone_attempt_id BIGINT NOT NULL,
    file_path VARCHAR NOT NULL,
    file_content TEXT NOT NULL,
    file_type VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    -- File analysis
    lines_of_code INTEGER GENERATED ALWAYS AS (length(file_content) - length(replace(file_content, chr(10), '')) + 1) STORED,
    file_size_bytes INTEGER GENERATED ALWAYS AS (length(file_content)) STORED,
    FOREIGN KEY (clone_attempt_id) REFERENCES clone_attempts (id)
);

CREATE TABLE model_benchmarks (
    id BIGINT PRIMARY KEY,
    model_name VARCHAR NOT NULL,
    provider VARCHAR NOT NULL,
    model_size VARCHAR, -- 3B, 7B, 13B, etc.
    hardware_specs JSON, -- GPU, RAM, etc.
    website_complexity VARCHAR,
    avg_generation_time_ms DOUBLE,
    avg_code_quality_score DOUBLE,
    success_rate DOUBLE,
    avg_user_satisfaction DOUBLE,
    total_attempts INTEGER,
    benchmark_date DATE DEFAULT TODAY(),
    notes TEXT
);

-- Insert comprehensive sample data
INSERT INTO websites VALUES
(1, 'https://stripe.com', 'Stripe - Online Payment Processing', 'Accept payments online', 
 '# Stripe\n\nThe new standard in online payments\n\nStripe is a suite of payment APIs that powers commerce for online businesses of all sizes, including fraud prevention, and support for popular payment methods. Stripe''s products power payments for online and in-person retailers, subscription businesses, software platforms and marketplaces, and everything in between.',
 '<html><head><title>Stripe</title></head><body><h1>Stripe</h1><p>The new standard in online payments</p><section class="hero"><h2>Accept payments online</h2><p>Stripe is a suite of payment APIs</p></section></body></html>',
 'https://images.unsplash.com/stripe-homepage.jpg', NOW(), '{"title": "Stripe", "description": "Online payments", "industry": "fintech"}', 'scraped'),

(2, 'https://vercel.com', 'Vercel - Develop. Preview. Ship.', 'Frontend cloud platform',
 '# Vercel\n\nDevelop. Preview. Ship.\n\nVercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration. Deploy your React, Next.js, Vue, Nuxt, Svelte, or static site in seconds.',
 '<html><head><title>Vercel</title></head><body><nav><h1>Vercel</h1></nav><main><h2>Develop. Preview. Ship.</h2><p>Frontend cloud platform</p></main></body></html>',
 'https://images.unsplash.com/vercel-homepage.jpg', NOW(), '{"title": "Vercel", "description": "Frontend cloud", "industry": "developer-tools"}', 'scraped'),

(3, 'https://tailwindcss.com', 'Tailwind CSS - Rapidly build modern websites', 'Utility-first CSS framework',
 '# Tailwind CSS\n\nRapidly build modern websites without ever leaving your HTML.\n\nA utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.',
 '<html><head><title>Tailwind CSS</title></head><body><header><h1>Tailwind CSS</h1></header><section><h2>Rapidly build modern websites</h2><p>Utility-first CSS framework</p></section></body></html>',
 'https://images.unsplash.com/tailwind-homepage.jpg', NOW(), '{"title": "Tailwind CSS", "description": "CSS framework", "industry": "developer-tools"}', 'scraped'),

(4, 'https://openai.com', 'OpenAI - AI Research and Deployment', 'Artificial intelligence research company',
 '# OpenAI\n\nAI for everyone\n\nCreating safe AGI that benefits all of humanity. Our API provides access to GPT-4, GPT-3.5-turbo, and other models for various applications.',
 '<html><head><title>OpenAI</title></head><body><h1>OpenAI</h1><p>AI for everyone</p><section><h2>Creating safe AGI</h2></section></body></html>',
 'https://images.unsplash.com/openai-homepage.jpg', NOW(), '{"title": "OpenAI", "description": "AI research", "industry": "ai"}', 'scraped');

-- Sample clone attempts with realistic data
INSERT INTO clone_attempts VALUES
(1, 1, 'ollama/llama3.2:7b', 'ollama', 'glassmorphism', 'Make it look modern with payment focused design', 
 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">\n      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-2xl p-8 m-8">\n        <h1 className="text-4xl font-bold text-gray-900 mb-4">Stripe</h1>\n        <p className="text-xl text-gray-700">The new standard in online payments</p>\n        <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg">Get Started</button>\n      </div>\n    </div>\n  );\n}',
 'http://localhost:3000/stripe-clone-1', NOW(), 'success', NULL, 3500, 8),

(2, 2, 'vllm/meta-llama/CodeLlama-7b-Instruct-hf', 'vllm', 'minimalist', NULL,
 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-white">\n      <header className="border-b border-gray-200 px-8 py-4">\n        <h1 className="text-2xl font-semibold">Vercel</h1>\n      </header>\n      <main className="px-8 py-16">\n        <h2 className="text-5xl font-bold mb-4">Develop. Preview. Ship.</h2>\n        <p className="text-xl text-gray-600">Frontend cloud platform</p>\n      </main>\n    </div>\n  );\n}',
 'http://localhost:3000/vercel-clone-1', NOW(), 'success', NULL, 2800, 7),

(3, 3, 'ollama/deepseek-coder:6.7b', 'ollama', 'gradient-rich', 'Use vibrant colors and modern gradients',
 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">\n      <div className="container mx-auto px-4 py-16">\n        <h1 className="text-6xl font-bold text-white mb-6">Tailwind CSS</h1>\n        <p className="text-2xl text-white/90 mb-8">Rapidly build modern websites</p>\n        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8">\n          <p className="text-white">Utility-first CSS framework</p>\n        </div>\n      </div>\n    </div>\n  );\n}',
 'http://localhost:3000/tailwind-clone-1', NOW(), 'success', NULL, 4200, 9),

(4, 4, 'lmstudio/gpt-oss-20b', 'lmstudio', 'dark-mode', 'Create a sleek dark theme',
 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-gray-900 text-white">\n      <nav className="border-b border-gray-800 px-8 py-4">\n        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">OpenAI</h1>\n      </nav>\n      <main className="px-8 py-20 text-center">\n        <h2 className="text-7xl font-bold mb-6">AI for everyone</h2>\n        <p className="text-xl text-gray-400 mb-12">Creating safe AGI that benefits all of humanity</p>\n        <button className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">Try GPT-4</button>\n      </main>\n    </div>\n  );\n}',
 'http://localhost:3000/openai-clone-1', NOW(), 'success', NULL, 6800, 9);

-- Performance benchmarks
INSERT INTO model_benchmarks VALUES
(1, 'llama3.2:7b', 'ollama', '7B', '{"gpu": "RTX 3080", "ram": "32GB", "cpu": "Intel i7-10700K"}', 'simple', 3200.0, 8.2, 0.95, 4.3, 50, TODAY(), 'Good performance for simple websites'),
(2, 'deepseek-coder:6.7b', 'ollama', '6.7B', '{"gpu": "RTX 3080", "ram": "32GB", "cpu": "Intel i7-10700K"}', 'medium', 4100.0, 8.8, 0.92, 4.6, 35, TODAY(), 'Excellent for code-specific tasks'),
(3, 'meta-llama/CodeLlama-7b-Instruct-hf', 'vllm', '7B', '{"gpu": "RTX 4090", "ram": "64GB", "cpu": "AMD Ryzen 9 5950X"}', 'medium', 2600.0, 8.0, 0.88, 4.2, 40, TODAY(), 'Fast with vLLM optimization'),
(4, 'gpt-oss-20b', 'lmstudio', '20B', '{"gpu": "RTX 4090", "ram": "64GB", "cpu": "AMD Ryzen 9 5950X"}', 'complex', 7200.0, 9.1, 0.85, 4.4, 25, TODAY(), 'High quality but slower'),
(5, 'claude-sonnet-4', 'anthropic', 'Unknown', '{"cloud": "true"}', 'complex', 4800.0, 9.6, 0.98, 4.8, 100, TODAY(), 'Reference cloud performance');

-- Create optimized indexes for analytics
CREATE INDEX idx_websites_domain ON websites(domain);
CREATE INDEX idx_websites_scraped_at ON websites(scraped_at);
CREATE INDEX idx_clone_attempts_provider ON clone_attempts(provider);
CREATE INDEX idx_clone_attempts_created_at ON clone_attempts(created_at);
CREATE INDEX idx_clone_attempts_generation_time ON clone_attempts(generation_time_ms);
CREATE INDEX idx_model_benchmarks_provider_model ON model_benchmarks(provider, model_name);

-- Analytical views for performance analysis
CREATE VIEW model_performance_summary AS
SELECT 
    provider,
    model_name,
    COUNT(*) as total_attempts,
    AVG(generation_time_ms) as avg_generation_time,
    COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*) as success_rate,
    AVG(code_size_bytes) as avg_code_size,
    MAX(created_at) as last_used
FROM clone_attempts 
GROUP BY provider, model_name
ORDER BY avg_generation_time;

CREATE VIEW website_complexity_analysis AS
SELECT 
    w.domain,
    w.title,
    w.word_count,
    w.content_length,
    COUNT(ca.id) as clone_attempts,
    AVG(ca.generation_time_ms) as avg_generation_time,
    AVG(ca.code_size_bytes) as avg_code_size
FROM websites w
LEFT JOIN clone_attempts ca ON w.id = ca.website_id
GROUP BY w.id, w.domain, w.title, w.word_count, w.content_length
ORDER BY w.word_count DESC;