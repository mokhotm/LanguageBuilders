import { generateLLMCompletion, isOllamaAvailable, getOllamaModels } from './llmProvider.js';

async function testOllama() {
  console.log('--- TESTING OLLAMA INTEGRATION ---');
  const available = await isOllamaAvailable();
  console.log(`Ollama Server Reachable: ${available}`);

  if (available) {
    const models = await getOllamaModels();
    console.log(`Installed Ollama Models:`, models);

    console.log('\nTesting local inference with qwen2.5-coder:1.5b...');
    const result = await generateLLMCompletion('Translate the word "computer" into Sesotho using compounding or semantic calque.', {
      temperature: 0.2
    });
    console.log('\n--- LLM RESULT ---');
    console.log(result);
  } else {
    console.log('Ollama is offline. Falling back to Gemini...');
  }
  process.exit(0);
}

testOllama();
