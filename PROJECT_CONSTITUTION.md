# PROJECT_CONSTITUTION.md

> Knowledge Operating System (Prototype)
> Version: 0.1

## Mission

Build a production-quality prototype of a web-based Knowledge Operating System.

The system transforms unstructured documents into an explainable Knowledge Graph.

The LLM is **not** the brain. The Knowledge Engine is the brain. LLMs only convert text into a structured intermediate representation.

## Goals

- Modern responsive web UI.
- Mobile-first and fast.
- Local application (single user).
- AI providers are replaceable.
- Graph is the source of truth.
- Explainable AI.
- Typed nodes and typed relations.
- Background processing.
- Extensible plugin architecture.

## Tech Stack

Frontend:
- React
- TypeScript
- Vite
- TailwindCSS
- React Flow
- Zustand
- TanStack Query

Backend:
- Rust
- Axum
- Tokio
- Serde

Storage:
- SQLite
- SQLite FTS5
- MessagePack or CBOR cache

## Main Pipeline

Import
→ Parse
→ Normalize
→ Chunk
→ Entity Extraction
→ Entity Resolution
→ Relation Discovery
→ Graph Builder
→ Search Index
→ Visualization

## Node Types

Question
Answer
Claim
Evidence
Argument
CounterArgument
Conclusion
Definition
Verse
Hadith
Scholar
Book
Article
Concept
Topic
Person
Place
Organization
Event
Timeline Event
Custom

## Edge Types

supports
refutes
answers
asks
defines
mentions
quotes
references
contradicts
related_to
same_entity
same_topic
authenticates
declares_weak
summarizes
expands
contains
belongs_to

## Rules

- Never duplicate entities.
- Never duplicate facts.
- Every node has provenance.
- Every edge has evidence.
- AI suggestions are editable.
- Verified data is never overwritten automatically.

## Import Formats

TXT
Markdown
PDF
DOCX
HTML
EPUB
Telegram Export
YouTube Transcript

## UI

Left Sidebar
Center Infinite Canvas
Right Inspector
Bottom Tasks
Command Palette

## Search

Keyword Search
Semantic Search
Graph Search

## AI Provider Contract

Every provider implements:

- ExtractEntities
- ExtractRelations
- ClassifyNodes
- Summarize
- Translate (optional)

Providers:
Gemini
OpenAI
Claude
OpenRouter

The engine never depends on provider-specific APIs.

## Sprint 1

- Create workspace.
- Backend skeleton.
- Frontend skeleton.
- SQLite.
- React Flow canvas.
- Mock graph.
- Import TXT.
- Search.

Definition of Done:
Application builds and runs.

## Sprint 2

- AI adapter abstraction.
- Gemini provider.
- Structured JSON output.
- Entity extraction.
- Relation extraction.

## Sprint 3

- Inspector.
- History.
- Graph editing.
- Import PDF.

## Sprint 4

- Entity resolution.
- Explainable AI.
- Saved searches.
- Timeline.

## Coding Rules

- No placeholder code.
- No TODOs.
- Every commit compiles.
- Every feature tested.
- Keep modules small.
- Separate UI, Engine and Storage.

## Final Objective

Deliver a working prototype where a user pastes text, receives an explainable knowledge graph, edits relationships manually, and can later connect any supported AI provider without changing the core engine.
