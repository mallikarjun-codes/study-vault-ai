import { env } from '../config/env.js';
import { SYSTEM_PROMPT } from '../utils/prompts.js';

const GROQ_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generates a grounded answer from Groq LLM using retrieved context and user question.
 *
 * @param {string} context - Formatted text chunks from retrieved documents.
 * @param {string} question - User question string.
 * @returns {Promise<string>} Generated grounded answer text.
 */
export async function generateAnswer(context, question) {
  const apiKey = env.groqApiKey;
  const model = env.groqModel || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    console.warn('GROQ_API_KEY is missing in env. Returning development mock response.');
    return `[Development Mode - GROQ_API_KEY not configured]\n\nBased on the retrieved context chunks:\n\n${context}\n\n*Question:* ${question}`;
  }

  try {
    const response = await fetch(GROQ_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API returned HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error('Groq API returned empty response content.');
    }

    return answer;
  } catch (error) {
    console.error('Groq Service Error:', error.message);
    throw error;
  }
}
