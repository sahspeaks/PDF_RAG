const { createEmbedding, generateResponse } = require("../utils/openaiService");
const { searchSimilarDocuments } = require("../utils/qdrantService");

/**
 * Handle user questions and generate answers using RAG approach
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function askQuestion(req, res) {
  try {
    const { query } = req.body;
    console.log("query", query);

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Create embedding for the query
    const queryEmbedding = await createEmbedding(query);

    // Search for similar documents in Qdrant
    const searchResults = await searchSimilarDocuments(queryEmbedding, 3);

    if (searchResults.length === 0) {
      return res.status(404).json({
        answer:
          "I couldn't find any relevant information to answer your question. Please try rephrasing or ask a different question.",
      });
    }

    // Extract the text from the search results to use as context
    const context = searchResults
      .map((result) => result.payload.text)
      .join("\n\n");

    // Generate a response using the context and query
    const answer = await generateResponse(query, context);

    res.status(200).json({
      answer,
      sources: searchResults.map((result) => ({
        fileName: result.payload.fileName,
        similarity: result.score,
      })),
    });
  } catch (error) {
    console.error("Error processing question:", error);
    res
      .status(500)
      .json({ error: "Error processing question", details: error.message });
  }
}

module.exports = {
  askQuestion,
};
