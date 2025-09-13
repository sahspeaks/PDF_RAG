const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - The extracted text
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Split text into chunks of approximately the specified size
 * @param {string} text - The text to split
 * @param {number} chunkSize - The approximate size of each chunk
 * @returns {Array<string>} - Array of text chunks
 */
function splitTextIntoChunks(text, chunkSize = 1000) {
  // Remove excessive whitespace and normalize
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  
  // Split by sentences to avoid cutting in the middle of a sentence
  const sentences = normalizedText.match(/[^.!?]+[.!?]+/g) || [];
  
  const chunks = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed the chunk size and we already have content,
    // push the current chunk and start a new one
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    
    currentChunk += sentence + ' ';
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

module.exports = {
  extractTextFromPDF,
  splitTextIntoChunks,
};