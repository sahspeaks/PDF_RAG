const path = require("path");
const crypto = require("crypto");
const {
  extractTextFromPDF,
  splitTextIntoChunks,
} = require("../utils/pdfProcessor");
const { createEmbedding } = require("../utils/openaiService");
const { storeEmbedding } = require("../utils/qdrantService");

/**
 * Handle PDF upload, process it, and store embeddings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function uploadPDF(req, res) {
  try {
    console.log("Upload request received:", {
      body: req.body,
      file: req.file,
    });

    if (!req.file) {
      console.error("No file in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    console.log("Processing file:", {
      path: filePath,
      name: fileName,
      size: req.file.size,
    });

    // Generate a unique document ID
    const documentId = crypto.randomUUID();

    // Extract text from PDF
    const text = await extractTextFromPDF(filePath);

    // Split text into chunks
    const chunks = splitTextIntoChunks(text);

    // Process each chunk and store in Qdrant
    const results = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Create embedding for the chunk
      const embedding = await createEmbedding(chunk);

      // Store embedding in Qdrant
      const chunkId = `${documentId}-chunk-${i}`;
      const metadata = {
        documentId,
        fileName,
        chunkIndex: i,
        text: chunk,
        totalChunks: chunks.length,
      };

      const result = await storeEmbedding(chunkId, embedding, metadata);
      results.push(result);
    }

    res.status(200).json({
      success: true,
      documentId,
      fileName,
      chunksProcessed: chunks.length,
    });
  } catch (error) {
    console.error("Error processing PDF upload:", error);
    res
      .status(500)
      .json({ error: "Error processing PDF upload", details: error.message });
  }
}

module.exports = {
  uploadPDF,
};
