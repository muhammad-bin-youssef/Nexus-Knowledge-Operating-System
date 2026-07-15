# Knowledge Operating System

A web-based Knowledge Operating System that transforms unstructured documents into an explainable Knowledge Graph.

The LLM is **not** the brain — the Knowledge Engine is. LLMs only convert text into structured intermediate representation (Sprint 2+).

## Sprint 1 (Current)

- Rust/Axum backend with SQLite + FTS5 search
- React/Vite frontend with React Flow canvas
- Mock knowledge graph seeded on first run
- TXT/Markdown import pipeline
- Keyword search
- Full UI layout: sidebar, canvas, inspector, tasks bar, command palette

## Quick Start

### Prerequisites

- Rust (1.75+)
- Node.js (20+)

### Run Backend

```bash
cd backend
cargo run
```

Backend listens on `http://127.0.0.1:3001`.

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend listens on `http://127.0.0.1:5173` and proxies API calls to the backend.

### Run Both (separate terminals)

```bash
# Terminal 1
cd backend && cargo run

# Terminal 2
cd frontend && npm run dev
```

Open http://127.0.0.1:5173 in your browser.

## Sample Data

Drop the sample file at `frontend/public/sample-knowledge.txt` into the app using the sidebar import button, or open the command palette with `Ctrl/Cmd + K` and choose "Import sample knowledge content".

## Architecture

```
Import → Parse → Normalize → Chunk → Entity Extraction → … → Graph → Search → Visualization
```

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React, TypeScript, Vite, TailwindCSS, React Flow, Zustand, TanStack Query |
| Backend  | Rust, Axum, Tokio, Serde                  |
| Storage  | SQLite, SQLite FTS5                       |

## API Endpoints

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/health`         | Health check             |
| GET    | `/api/graph`          | Full graph snapshot      |
| GET    | `/api/graph/nodes/:id`| Single node              |
| GET    | `/api/search?q=…`     | Keyword search (FTS5)    |
| POST   | `/api/import/txt`     | Import TXT/MD file       |

## Environment Variables

| Variable       | Default   | Description          |
|----------------|-----------|----------------------|
| `KOS_PORT`     | `3001`    | Backend port         |
| `KOS_DATA_DIR` | `./data`  | SQLite database dir  |

## Keyboard Shortcuts

| Shortcut       | Action            |
|----------------|-------------------|
| `Ctrl/Cmd + K` | Command palette   |

## Project Constitution

See [PROJECT_CONSTITUTION.md](./PROJECT_CONSTITUTION.md) for full specification, node/edge types, and sprint roadmap.
