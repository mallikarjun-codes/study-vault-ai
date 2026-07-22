# Study Vault AI — AI-Powered Personal Knowledge & Study Assistant

**Study Vault AI** is a production-grade Retrieval-Augmented Generation (RAG) platform designed for students, researchers, and professionals. Upload your lecture notes, textbooks, and research papers (PDF, DOCX, TXT) to create a personalized knowledge vault and converse with an AI assistant that answers strictly using your uploaded materials with exact source citations.

---

## 🏗️ System Architecture

```
                                    +-----------------------+
                                    |   Uploaded Document   |
                                    |   (PDF, DOCX, TXT)    |
                                    +-----------+-----------+
                                                |
                                                v
                                    +-----------------------+
                                    | Text Extraction Engine|
                                    | (pdf-parse, mammoth)  |
                                    +-----------+-----------+
                                                |
                                                v
                                    +-----------------------+
                                    | Overlapping Chunks    |
                                    |  (500-1000 tokens)    |
                                    +-----------+-----------+
                                                |
                                                v
                                    +-----------------------+
                                    | HuggingFace Embedding |
                                    | (all-MiniLM-L6-v2)    |
                                    +-----------+-----------+
                                                |
                                                v
                                    +-----------------------+
                                    |  Pinecone Vector DB   |
                                    |  (User Namespace)     |
                                    +-----------+-----------+
                                                |
User Query ----> Embedding ----> Top-K Vector Search ----> Grounded Prompt ----> Groq LLM API ----> Cited Answer
```

---

## ⚡ Core Features

- **🔐 Secure Authentication**: JWT authentication with bcrypt password hashing & session isolation.
- **📄 Multi-Format Document Ingestion**: Upload PDF, DOCX, or TXT study materials with automated text extraction.
- **🧩 Overlapping Text Chunking**: Semantic sliding window chunking preserving contextual integrity across section boundaries.
- **📐 Vector Indexing**: High-dimensional embeddings stored in Pinecone vector index namespaced per user.
- **🎯 Top-K Grounded RAG Query Pipeline**: Cosine similarity retrieval over Pinecone with document-scoped query filtering.
- **🤖 Groq LLM Answer Generation**: Hallucination-resistant answers with strict context grounding and source citations.
- **💬 Persistent Chat Sessions**: Multi-turn study conversations saved in Neon PostgreSQL.
- **✨ Clean UI/UX**: Dark mode interface built with React, Vite, and Tailwind CSS, featuring collapsible source citations and mobile responsiveness.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6.
- **Backend**: Node.js, Express.js, Prisma ORM, Neon Serverless PostgreSQL.
- **Vector Database**: Pinecone Vector Database.
- **Embeddings & LLM**: `@xenova/transformers` (`all-MiniLM-L6-v2`), Groq API (`llama-3.3-70b-versatile`).

---

## ⚙️ Environment Variables Setup

Copy `backend/.env.example` to `backend/.env` and populate the required keys:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/studyvault?sslmode=require"
JWT_SECRET="your_jwt_secret_key"
PINECONE_API_KEY="your_pinecone_api_key"
PINECONE_INDEX_NAME="study-vault"
GROQ_API_KEY="your_groq_api_key"
GROQ_MODEL="llama-3.3-70b-versatile"
TOP_K=5
```

---

## 🚀 Local Development Guide

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be running locally at:
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`

---

## 🌐 Production Deployment Guide

### Frontend Deployment (Vercel)
1. Import the `frontend` directory to Vercel.
2. Ensure build command is `npm run build` and output directory is `dist`.
3. Set `VITE_API_URL` environment variable if pointing to a remote backend API.
4. `vercel.json` is preconfigured for single-page application routing.

### Backend Deployment (Render / Railway)
1. Deploy the `backend` directory to Render or Railway.
2. Supply environment variables (`DATABASE_URL`, `JWT_SECRET`, `PINECONE_API_KEY`, `GROQ_API_KEY`).
3. Set `FRONTEND_URL` to your production frontend URL to allow CORS requests.
4. Run `npx prisma migrate deploy` in post-build command.