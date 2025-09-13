const { QdrantClient } = require("@qdrant/js-client-rest");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});
const collectionName = process.env.QDRANT_COLLECTION_NAME;

/**
 * Initialize the Qdrant collection if it doesn't exist
 */
async function initializeCollection() {
  try {
    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      (c) => c.name === collectionName
    );

    if (!collectionExists) {
      // Create collection with the appropriate vector size for the embedding model
      await qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 1536, // Size for text-embedding-3-small
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
      });
      console.log(`Collection ${collectionName} created successfully`);
    } else {
      console.log(`Collection ${collectionName} already exists`);
    }
  } catch (error) {
    console.error("Error initializing Qdrant collection:", error);
    throw error;
  }
}

/**
 * Store a document embedding in Qdrant
 * @param {string} documentId - Unique identifier for the document
 * @param {Array<number>} embedding - The embedding vector
 * @param {Object} metadata - Additional metadata about the document
 * @returns {Promise<Object>} - The result of the operation
 */
async function storeEmbedding(documentId, embedding, metadata) {
  try {
    await initializeCollection();
    
    // Convert string ID to UUID if it's not already a UUID
    let pointId;
    // Always generate a new UUID to ensure proper format
    pointId = require('crypto').randomUUID();
    // Store the original ID in metadata
    metadata.originalId = documentId;

    const result = await qdrantClient.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: metadata,
        },
      ],
    });

    return result;
  } catch (error) {
    console.error("Error storing embedding:", error);
    throw error;
  }
}

/**
 * Search for similar documents in Qdrant
 * @param {Array<number>} queryEmbedding - The query embedding vector
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array<Object>>} - The search results
 */
async function searchSimilarDocuments(queryEmbedding, limit = 5) {
  try {
    const searchResult = await qdrantClient.search(collectionName, {
      vector: queryEmbedding,
      limit: limit,
      with_payload: true,
    });

    return searchResult;
  } catch (error) {
    console.error("Error searching similar documents:", error);
    throw error;
  }
}

module.exports = {
  initializeCollection,
  storeEmbedding,
  searchSimilarDocuments,
};
