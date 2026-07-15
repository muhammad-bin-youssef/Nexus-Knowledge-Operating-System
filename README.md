# Knowledge Operating System

Knowledge OS is a web-based knowledge graph application that converts unstructured text into an inspectable graph of nodes, edges, and searchable content.

This repository currently includes:

- A Rust/Axum backend serving graph data, search, and file import APIs
- A React/Vite frontend with a graph canvas, sidebar, inspector, tutorial, and command palette
- SQLite storage with FTS5 search indexing
- Sample import support for English and Arabic knowledge content

## What It Does

- Imports TXT / Markdown content
- Breaks text into nodes and relations
- Stores graph structure in SQLite
- Serves graph snapshots and search results over REST
- Displays graph and node details in a browser UI

## Requirements

- Rust 1.75 or newer
- Node.js 20 or newer
- npm (bundled with Node.js) or another Node package manager

> macOS, Linux, and Windows are supported. On Windows, use PowerShell, CMD, or WSL for shell commands.

## Getting Started

### Clone the repository

```bash
git clone https://github.com/muhammad-bin-youssef/Nexus-Knowledge-Operating-System-VIBECODED.git
cd AI
```

### Install frontend dependencies

```bash
cd frontend
npm install
```

### Run the backend

Open a terminal and run:

```bash
cd backend
cargo run
```

The backend listens on `http://127.0.0.1:3001` by default.

### Run the frontend

Open a second terminal and run:

```bash
cd frontend
npm run dev
```

The frontend runs on `http://127.0.0.1:5173` and proxies API requests to the backend.

### Start both services together

#### macOS / Linux

Use the provided launcher:

```bash
./start.sh
```

#### Windows

Use separate terminals or WSL:

```powershell
cd backend
cargo run
```

```powershell
cd frontend
npm run dev
```

Then open `http://127.0.0.1:5173`.

## Docker

The project includes Docker support for plug-and-play startup.

```bash
docker compose up --build
```

(If your system uses the older CLI, you can also run `docker-compose up --build`.)

This starts both services and publishes:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:3001`

The frontend is configured to proxy `/api` to the backend container automatically.

### Override backend port

```bash
KOS_PORT=3002 docker compose up --build
```

### Persistent data

A local `./data` directory is mounted into the backend container so the SQLite database persists across restarts.

## Cross-Platform Notes

### Linux / macOS

- `./start.sh` starts backend and frontend together
- To override the backend port, use:

```bash
KOS_PORT=3002 ./start.sh
```

### Windows PowerShell

```powershell
$env:KOS_PORT = 3002
cd backend
cargo run
```

### Windows CMD

```cmd
set KOS_PORT=3002
cd backend
cargo run
```

### Data storage

The backend uses `KOS_DATA_DIR` to store the SQLite database. By default it writes to `./data`.

## Usage

- Import TXT or Markdown files from the sidebar
- Use the command palette with `Ctrl/Cmd + K`
- Search the graph using keywords
- Inspect nodes and provenance on the canvas
- Load sample knowledge from the sidebar buttons

## Sample Data

The frontend includes sample files in `frontend/public/`:

- `sample-knowledge.txt`
- `sample-knowledge-ar.txt`

Use the sidebar import buttons to load either sample dataset.

## API Endpoints

| Method | Path                    | Description                    |
|--------|-------------------------|--------------------------------|
| GET    | `/api/health`           | Health check                   |
| GET    | `/api/graph`            | Full graph snapshot            |
| GET    | `/api/graph/nodes/:id`  | Single node details            |
| GET    | `/api/search?q=...`     | Keyword search (FTS5)          |
| POST   | `/api/import/txt`       | Upload TXT/MD content          |
| POST   | `/api/graph/reset`      | Reset graph to seeded sample   |

## Environment Variables

| Variable       | Default   | Description                         |
|----------------|-----------|-------------------------------------|
| `KOS_PORT`     | `3001`    | Backend port                        |
| `KOS_DATA_DIR` | `./data`  | Directory for SQLite data storage   |

## Troubleshooting

- If the backend fails to start because port `3001` is in use, choose another port with `KOS_PORT`
- If frontend API requests fail, verify the backend is running and the proxy is pointing to the correct port
- Run `npm install` inside `frontend` before starting the frontend
- Run `cargo build` inside `backend` to confirm Rust dependencies are installed

## Project Architecture

- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query
- Backend: Rust, Axum, Tokio, Serde, rusqlite
- Storage: SQLite with FTS5 search for node indexing

## Keyboard Shortcut

| Shortcut       | Action            |
|----------------|-------------------|
| `Ctrl/Cmd + K` | Open command palette |

## More Information

See [PROJECT_CONSTITUTION.md](./PROJECT_CONSTITUTION.md) for design goals, sprint planning, and detailed architecture notes.
