# PDF-powered AI Research Assistant

A full-stack application that allows users to upload PDFs, process them into embeddings stored in Qdrant, and ask natural language questions about the content using OpenAI's GPT.

## Features

- Upload and process PDF documents
- Extract text and create embeddings
- Store embeddings in Qdrant vector database
- Ask natural language questions about PDF content
- Retrieve relevant information using vector search
- Generate answers using OpenAI GPT

## Tech Stack

### Backend

- Node.js with Express
- OpenAI API for embeddings and text generation
- Qdrant for vector storage and similarity search
- Multer for file uploads
- PDF-parse for text extraction

### Frontend

- React.js
- Tailwind CSS for styling
- Axios for API requests

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Qdrant (running locally or cloud instance)
- OpenAI API key

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd pdf-ai-research-assistant
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Configure environment variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
OPENAI_API_KEY=your_openai_api_key
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=pdf_embeddings
```

4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server

```bash
cd backend
npm run dev
```

2. Start the frontend development server

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Upload a PDF document using the upload screen
2. Once processed, you'll be taken to the chat interface
3. Ask questions about the PDF content
4. The system will retrieve relevant information and generate answers

## Project Structure

```
├── backend/
│   ├── controllers/       # Request handlers
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── uploads/           # Uploaded PDF files
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
│
└── frontend/
    ├── public/            # Static files
    ├── src/
    │   ├── components/    # React components
    │   ├── App.jsx        # Main application component
    │   └── main.jsx       # Entry point
    ├── index.html         # HTML template
    ├── package.json       # Frontend dependencies
    └── tailwind.config.js # Tailwind CSS configuration
```

## License
