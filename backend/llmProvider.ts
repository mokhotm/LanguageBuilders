import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Bypass SSL certificate revocation checks for local HTTPS/proxy if needed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:1.5b'; // Default local model
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface LLMCompletionOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Check if local Ollama server is running and reachable
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const res = await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 2000 });
    return res.status === 200 && Array.isArray(res.data?.models);
  } catch (err) {
    return false;
  }
}

/**
 * Get available local Ollama models
 */
export async function getOllamaModels(): Promise<string[]> {
  try {
    const res = await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 2000 });
    if (res.data?.models) {
      return res.data.models.map((m: any) => m.name);
    }
  } catch (err) {
    // ignore
  }
  return [];
}

/**
 * Unified LLM completion function: Tries Ollama first for zero token costs, falls back to Gemini.
 */
export async function generateLLMCompletion(
  prompt: string,
  options: LLMCompletionOptions = {}
): Promise<string> {
  const temperature = options.temperature ?? 0.3;

  // 1. Try local Ollama inference first
  const ollamaOnline = await isOllamaAvailable();
  if (ollamaOnline) {
    try {
      const models = await getOllamaModels();
      // Select preferred model if specified, otherwise pick available model or default
      let activeModel = OLLAMA_MODEL;
      if (models.length > 0 && !models.includes(activeModel)) {
        activeModel = models[0]; // pick first installed model (e.g. qwen2.5-coder:1.5b)
      }

      console.log(`🦙 [LLM Provider] Running local Ollama inference using model: "${activeModel}"...`);

      const payload: any = {
        model: activeModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature
        }
      };

      if (options.systemPrompt) {
        payload.system = options.systemPrompt;
      }

      if (options.jsonMode) {
        payload.format = 'json';
      }

      const res = await axios.post(`${OLLAMA_HOST}/api/generate`, payload, { timeout: 45000 });
      if (res.data && res.data.response) {
        return res.data.response.trim();
      }
    } catch (ollamaErr: any) {
      console.warn(`🦙 [LLM Provider] Ollama inference warning: ${ollamaErr.message}. Falling back to Gemini...`);
    }
  } else {
    console.log(`☁️ [LLM Provider] Ollama offline. Routing query to Gemini API...`);
  }

  // 2. Fallback to Gemini API
  if (!GEMINI_API_KEY) {
    throw new Error('Neither Ollama nor GEMINI_API_KEY are available.');
  }

  const fullPrompt = options.systemPrompt
    ? `${options.systemPrompt}\n\nUSER PROMPT:\n${prompt}`
    : prompt;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await axios.post(url, {
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: {
      temperature,
      responseMimeType: options.jsonMode ? 'application/json' : 'text/plain'
    }
  }, { timeout: 30000 });

  const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned an empty response.');
  }

  return rawText.trim();
}
