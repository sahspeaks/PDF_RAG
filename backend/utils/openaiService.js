const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Create embeddings for a text using OpenAI's embedding model
 * @param {string} text - The text to create embeddings for
 * @returns {Promise<Array<number>>} - The embedding vector
 */
async function createEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

/**
 * Generate a response using OpenAI's GPT model
 * @param {string} prompt - The prompt for the model
 * @param {Array<{role: string, content: string}>} messages - The conversation history
 * @returns {Promise<string>} - The generated response
 */
async function generateResponse(prompt, context) {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI research assistant.You will be given a PDF file as context. Use the following context to answer the user's question. If you don't know the answer based on the provided context, say so politely.\n\nContext: ${context}`,
      },
      { role: "user", content: prompt },
    ];

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
      temperature: 0.7,
    });

    return response.output_text;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}

module.exports = {
  createEmbedding,
  generateResponse,
};
