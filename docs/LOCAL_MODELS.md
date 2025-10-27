# Local Model Support Guide

Open Lovable now supports running with local AI models as an alternative to cloud providers. This guide covers setup and configuration for Ollama, vLLM, and LM Studio.

## Overview

Local models offer several advantages:
- **Privacy**: All data stays on your machine
- **Cost**: No API fees after initial setup
- **Control**: Full control over model versions and capabilities
- **Offline**: Works without internet connection

## System Requirements

### Minimum Requirements
- **Model Size**: 3B parameters minimum
- **RAM/VRAM**: 4GB+ available memory
- **Examples**: Llama 3.2 3B, CodeGemma 2B

### Recommended Configuration
- **Model Size**: 7B+ parameters
- **RAM/VRAM**: 8GB+ available memory  
- **Examples**: Llama 3.2 7B, DeepSeek Coder 6.7B, Code Llama 7B

### Optimal Performance
- **Model Size**: 13B+ parameters
- **RAM/VRAM**: 16GB+ available memory
- **Examples**: Code Llama 13B, DeepSeek Coder 33B

## Provider Setup

### 1. Ollama (Recommended)

Ollama provides the easiest setup with excellent model management.

#### Installation
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

#### Model Installation
```bash
# Recommended for code generation
ollama pull llama3.2:7b
ollama pull deepseek-coder:6.7b
ollama pull codellama:7b

# Lightweight options
ollama pull llama3.2:3b
ollama pull codegemma:7b

# Advanced options
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder:33b
```

#### Start Ollama Server
```bash
# Ollama starts automatically after installation
# Manual start if needed:
ollama serve
```

#### Environment Configuration
```bash
# .env.local
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434/v1
```

### 2. vLLM (Production Ready)

vLLM offers optimized inference for production use cases.

#### Installation
```bash
pip install vllm
```

#### Start vLLM Server
```bash
# Code Llama 7B
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/CodeLlama-7b-Instruct-hf \
  --port 8000

# DeepSeek Coder 6.7B
python -m vllm.entrypoints.openai.api_server \
  --model deepseek-ai/deepseek-coder-6.7b-instruct \
  --port 8000

# With GPU optimization
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/CodeLlama-7b-Instruct-hf \
  --tensor-parallel-size 1 \
  --dtype float16
```

#### Environment Configuration
```bash
# .env.local
VLLM_ENABLED=true
VLLM_BASE_URL=http://localhost:8000/v1
```

### 3. LM Studio (GUI)

LM Studio provides a user-friendly GUI for model management.

#### Installation
1. Download from [https://lmstudio.ai/](https://lmstudio.ai/)
2. Install the application
3. Launch LM Studio

#### Model Setup
1. Open LM Studio
2. Go to "Search" tab
3. Download recommended models:
   - `microsoft/DialoGPT-medium`
   - `deepseek-ai/deepseek-coder-v2-lite`
   - `meta-llama/CodeLlama-7b-Instruct-hf`

#### Start Local Server
1. Go to "Local Server" tab
2. Select your downloaded model
3. Click "Start Server"
4. Server runs on `http://localhost:1234/v1`

#### Environment Configuration
```bash
# .env.local
LMSTUDIO_ENABLED=true
LMSTUDIO_BASE_URL=http://localhost:1234/v1
```

## Model Selection in Open Lovable

Once configured, local models appear in the model dropdown:

### Ollama Models
- `Llama 3.2 7B (Ollama)`
- `DeepSeek Coder 6.7B (Ollama)`
- `Code Llama 7B (Ollama)`

### vLLM Models
- `Code Llama 7B (vLLM)`
- `DeepSeek Coder 6.7B (vLLM)`

### LM Studio Models
- `GPT-OSS 20B (LM Studio)`
- `DeepSeek Coder V2 Lite (LM Studio)`

## Performance Comparison

| Provider | Setup Difficulty | Performance | GPU Utilization | Memory Efficiency |
|----------|------------------|-------------|-----------------|-------------------|
| Ollama   | Easy            | Good        | Automatic       | Excellent         |
| vLLM     | Moderate        | Excellent   | Optimized       | Very Good         |
| LM Studio| Very Easy       | Good        | Automatic       | Good              |

## Recommended Models by Use Case

### Web Development
- **Ollama**: `deepseek-coder:6.7b`
- **vLLM**: `deepseek-ai/deepseek-coder-6.7b-instruct`
- **LM Studio**: `deepseek-coder-v2-lite`

### General Purpose
- **Ollama**: `llama3.2:7b`
- **vLLM**: `meta-llama/Llama-2-7b-chat-hf`
- **LM Studio**: `gpt-oss-20b`

### Code-Specific Tasks
- **Ollama**: `codellama:7b`
- **vLLM**: `meta-llama/CodeLlama-7b-Instruct-hf`
- **LM Studio**: `codellama-7b-instruct`

## Troubleshooting

### Model Not Responding
1. Check if the local server is running
2. Verify the correct port in environment variables
3. Ensure model is properly loaded

### Out of Memory Errors
1. Use smaller models (3B instead of 7B)
2. Close other applications
3. Increase system swap space

### Slow Generation
1. Ensure model is running on GPU (if available)
2. Use quantized models for faster inference
3. Consider upgrading hardware

### Connection Issues
```bash
# Test Ollama connection
curl http://localhost:11434/v1/models

# Test vLLM connection  
curl http://localhost:8000/v1/models

# Test LM Studio connection
curl http://localhost:1234/v1/models
```

## Migration from Cloud to Local

1. **Install preferred local provider** (Ollama recommended)
2. **Download suitable model** for your hardware
3. **Update environment variables** to enable local provider
4. **Test model selection** in Open Lovable interface
5. **Compare code quality** with your previous cloud provider

## Hardware Recommendations

### Budget Setup ($500-1000)
- 16GB RAM
- RTX 3060/4060 (12GB VRAM)
- Models: 3B-7B parameters

### Performance Setup ($1000-2000)
- 32GB RAM
- RTX 4070/4080 (16GB+ VRAM)
- Models: 7B-13B parameters

### Enthusiast Setup ($2000+)
- 64GB+ RAM
- RTX 4090/A6000 (24GB+ VRAM)
- Models: 13B-70B parameters

## Contributing

Local model support is an ongoing project. Contributions welcome for:

- Additional model provider support
- Performance optimizations
- Model recommendation improvements
- Hardware-specific guidance

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development setup.