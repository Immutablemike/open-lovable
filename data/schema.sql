-- Sample website cloning database schema
-- SQLite database for storing scraped websites and clone attempts

CREATE TABLE IF NOT EXISTS websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    description TEXT,
    markdown_content TEXT,
    html_content TEXT,
    screenshot_url TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    firecrawl_metadata JSON,
    status TEXT DEFAULT 'scraped' -- scraped, processed, cloned
);

CREATE TABLE IF NOT EXISTS clone_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    website_id INTEGER NOT NULL,
    model_used TEXT NOT NULL,
    style_selected TEXT,
    additional_instructions TEXT,
    generated_code TEXT,
    sandbox_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending', -- pending, success, failed
    error_message TEXT,
    FOREIGN KEY (website_id) REFERENCES websites (id)
);

CREATE TABLE IF NOT EXISTS code_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clone_attempt_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_content TEXT NOT NULL,
    file_type TEXT, -- jsx, css, js, json, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clone_attempt_id) REFERENCES clone_attempts (id)
);

CREATE TABLE IF NOT EXISTS model_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    provider TEXT NOT NULL, -- openai, anthropic, ollama, vllm, lmstudio
    website_complexity TEXT, -- simple, medium, complex
    generation_time_ms INTEGER,
    code_quality_score INTEGER, -- 1-10 subjective rating
    compilation_success BOOLEAN,
    user_satisfaction INTEGER, -- 1-5 rating
    notes TEXT,
    tested_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT OR IGNORE INTO websites (url, title, description, markdown_content, html_content) VALUES
('https://stripe.com', 'Stripe - Online Payment Processing', 'Accept payments online', 
'# Stripe\n\nThe new standard in online payments\n\nStripe is a suite of payment APIs that powers commerce for online businesses of all sizes.',
'<html><body><h1>Stripe</h1><p>The new standard in online payments</p></body></html>'),

('https://vercel.com', 'Vercel - Develop. Preview. Ship.', 'Frontend cloud platform',
'# Vercel\n\nDevelop. Preview. Ship.\n\nVercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.',
'<html><body><h1>Vercel</h1><p>Develop. Preview. Ship.</p></body></html>'),

('https://tailwindcss.com', 'Tailwind CSS - Rapidly build modern websites', 'Utility-first CSS framework',
'# Tailwind CSS\n\nRapidly build modern websites without ever leaving your HTML.\n\nA utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90.',
'<html><body><h1>Tailwind CSS</h1><p>Rapidly build modern websites</p></body></html>');

-- Sample clone attempts
INSERT OR IGNORE INTO clone_attempts (website_id, model_used, style_selected, generated_code, status) VALUES
(1, 'ollama/llama3.2:7b', 'glassmorphism', 
'import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-2xl p-8 m-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Stripe</h1>
        <p className="text-xl text-gray-700">The new standard in online payments</p>
      </div>
    </div>
  );
}', 'success'),

(2, 'vllm/meta-llama/CodeLlama-7b-Instruct-hf', 'minimalist', 
'import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-8 py-4">
        <h1 className="text-2xl font-semibold">Vercel</h1>
      </header>
      <main className="px-8 py-16">
        <h2 className="text-5xl font-bold mb-4">Develop. Preview. Ship.</h2>
        <p className="text-xl text-gray-600">Frontend cloud platform</p>
      </main>
    </div>
  );
}', 'success');

-- Sample performance data
INSERT OR IGNORE INTO model_performance (model_name, provider, website_complexity, generation_time_ms, code_quality_score, compilation_success, user_satisfaction) VALUES
('llama3.2:7b', 'ollama', 'simple', 3500, 8, 1, 4),
('deepseek-coder:6.7b', 'ollama', 'medium', 4200, 9, 1, 5),
('meta-llama/CodeLlama-7b-Instruct-hf', 'vllm', 'simple', 2800, 7, 1, 4),
('gpt-oss-20b', 'lmstudio', 'complex', 8500, 9, 1, 4),
('claude-sonnet-4', 'anthropic', 'complex', 5200, 10, 1, 5);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_websites_url ON websites(url);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_website_id ON clone_attempts(website_id);
CREATE INDEX IF NOT EXISTS idx_clone_attempts_model ON clone_attempts(model_used);
CREATE INDEX IF NOT EXISTS idx_code_files_clone_id ON code_files(clone_attempt_id);
CREATE INDEX IF NOT EXISTS idx_performance_model ON model_performance(model_name, provider);
CREATE INDEX IF NOT EXISTS idx_performance_complexity ON model_performance(website_complexity);