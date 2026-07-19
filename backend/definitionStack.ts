import { generateLLMCompletion } from './llmProvider';

export interface DefinitionStack {
  primaryDefinition: string;
  keyConcepts: { term: string; definition: string }[];
}

export async function fetchDefinitionStack(word: string, apiKey?: string): Promise<DefinitionStack> {
  try {
    const prompt = `You are a technical lexicographer. For the STEM word "${word}", build a structured definition stack:
1. Write a clear, standard definition of the word.
2. Extract the key technical terms/concepts used in that definition.
3. Define each of those extracted terms in the same context.

Return ONLY a valid JSON object matching this schema:
{
  "primaryDefinition": "Definition of ${word}",
  "keyConcepts": [
    {
      "term": "term name",
      "definition": "term definition"
    }
  ]
}`;

    const jsonText = await generateLLMCompletion(prompt, { jsonMode: true, temperature: 0.2 });
    if (jsonText) {
      // Clean potential markdown codeblock wrappers if present
      const cleanJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (err: any) {
    console.warn(`Failed to fetch definition stack for "${word}", using default:`, err.message);
  }
  return {
    primaryDefinition: `The technical term representing ${word}.`,
    keyConcepts: []
  };
}
