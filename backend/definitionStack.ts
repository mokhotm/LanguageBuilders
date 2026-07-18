import axios from 'axios';

export interface DefinitionStack {
  primaryDefinition: string;
  keyConcepts: { term: string; definition: string }[];
}

export async function fetchDefinitionStack(word: string, apiKey: string): Promise<DefinitionStack> {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a technical lexicographer. For the STEM word "${word}", build a structured definition stack:
1. Write a clear, standard definition of the word.
2. Extract the key technical terms/concepts used in that definition.
3. Define each of those extracted terms in the same context.

Return ONLY a JSON object matching this schema:
{
  "primaryDefinition": "Definition of ${word}",
  "keyConcepts": [
    {
      "term": "term name",
      "definition": "term definition"
    }
  ]
}`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    const jsonText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (jsonText) {
      return JSON.parse(jsonText);
    }
  } catch (err: any) {
    console.warn("Failed to fetch definition stack, using empty defaults:", err.message);
  }
  return {
    primaryDefinition: `The technical term representing ${word}.`,
    keyConcepts: []
  };
}
