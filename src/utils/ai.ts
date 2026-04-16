/// <reference types="vite/client" />
import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Check if using OpenRouter
const isOpenRouter = apiKey?.startsWith('sk-or-v1');

// Debugging: Log key prefix to verify loaded environment
console.log('AI Config:', {
  keyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING',
  isOpenRouter,
  baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : 'default(openai)'
});

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
  dangerouslyAllowBrowser: true, // Required for client-side only usage
  defaultHeaders: isOpenRouter ? {
    'HTTP-Referer': 'https://noteflow.app', // Optional: Site URL
    'X-Title': 'NoteFlow', // Optional: Site Name
  } : undefined
});

export const processTextWithAI = async (text: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API Key is missing');
  }

  // Truncate input to avoid hitting token limits, though 15k chars is usually safe
  const truncatedText = text.substring(0, 15000);

  const prompt = `
    Analyze the following text and restructure it into a clean Markdown format suitable for creating a flowchart and flashcards.
    
    Rules:
    1. Use '# Heading' for main topics (Level 1).
    2. Use '## Subheading' for sub-topics (Level 2).
    3. Use bullet points '-' for details.
    4. You can use nested bullet points (indent with 2 spaces) for deeper levels.
    5. Identify key terms and definitions. Format them as bullet points like this: '- KeyTerm : Definition'.
    6. Ensure the output is valid Markdown.
    7. Keep the structure hierarchical.
    8. Do not include any conversational text, just the Markdown output.

    Text to process:
    ${truncatedText}
  `;

  try {
    const response = await openai.chat.completions.create({
      // User specified model ID
      model: isOpenRouter ? "google/gemini-3.1-pro-preview" : "gpt-4o-mini", 
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes text into structured Markdown notes." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error processing text with AI:', error);
    throw error;
  }
};
