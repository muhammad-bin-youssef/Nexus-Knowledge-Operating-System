use rusqlite::{params, Connection};
use std::path::Path;
use std::sync::Mutex;
use thiserror::Error;

use crate::engine::types::{GraphEdge, GraphNode, GraphSnapshot, SearchResult};

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("node not found: {0}")]
    NodeNotFound(String),
}

pub struct Storage {
    conn: Mutex<Connection>,
}

impl Storage {
    pub fn open(path: &Path) -> Result<Self, StorageError> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).ok();
        }
        let conn = Connection::open(path)?;
        let storage = Self {
            conn: Mutex::new(conn),
        };
        storage.migrate()?;
        Ok(storage)
    }

    pub fn open_in_memory() -> Result<Self, StorageError> {
        let conn = Connection::open_in_memory()?;
        let storage = Self {
            conn: Mutex::new(conn),
        };
        storage.migrate()?;
        Ok(storage)
    }

    fn migrate(&self) -> Result<(), StorageError> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS sources (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                source_type TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS nodes (
                id TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                node_type TEXT NOT NULL,
                content TEXT,
                verified INTEGER NOT NULL DEFAULT 0,
                position_x REAL NOT NULL DEFAULT 0,
                position_y REAL NOT NULL DEFAULT 0,
                provenance TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS edges (
                id TEXT PRIMARY KEY,
                source_id TEXT NOT NULL,
                target_id TEXT NOT NULL,
                edge_type TEXT NOT NULL,
                evidence TEXT NOT NULL,
                verified INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (source_id) REFERENCES nodes(id),
                FOREIGN KEY (target_id) REFERENCES nodes(id)
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS node_search USING fts5(
                node_id UNINDEXED,
                label,
                content,
                tokenize = 'porter unicode61'
            );
            ",
        )?;
        Ok(())
    }

    pub fn insert_source(
        &self,
        id: &str,
        title: &str,
        source_type: &str,
        content: &str,
    ) -> Result<(), StorageError> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO sources (id, title, source_type, content, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, title, source_type, content, chrono::Utc::now().to_rfc3339()],
        )?;
        Ok(())
    }

    pub fn insert_node(&self, node: &GraphNode) -> Result<(), StorageError> {
        let conn = self.conn.lock().unwrap();
        let provenance = serde_json::to_string(&node.provenance)?;
        conn.execute(
            "INSERT INTO nodes (id, label, node_type, content, verified, position_x, position_y, provenance, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                node.id,
                node.label,
                node.node_type,
                node.content,
                node.verified as i32,
                node.position_x,
                node.position_y,
                provenance,
                node.created_at.to_rfc3339(),
                node.updated_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn insert_edge(&self, edge: &GraphEdge) -> Result<(), StorageError> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO edges (id, source_id, target_id, edge_type, evidence, verified, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                edge.id,
                edge.source_id,
                edge.target_id,
                edge.edge_type,
                edge.evidence,
                edge.verified as i32,
                edge.created_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn index_node(&self, node_id: &str, label: &str, content: &str) -> Result<(), StorageError> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO node_search (node_id, label, content) VALUES (?1, ?2, ?3)",
            params![node_id, label, content],
        )?;
        Ok(())
    }

    pub fn get_graph(&self) -> Result<GraphSnapshot, StorageError> {
        let conn = self.conn.lock().unwrap();
        let mut node_stmt = conn.prepare(
            "SELECT id, label, node_type, content, verified, position_x, position_y, provenance, created_at, updated_at FROM nodes",
        )?;
        let nodes = node_stmt
            .query_map([], |row| {
                let provenance_str: String = row.get(7)?;
                let provenance = serde_json::from_str(&provenance_str).map_err(|e| {
                    rusqlite::Error::FromSqlConversionFailure(7, rusqlite::types::Type::Text, Box::new(e))
                })?;
                Ok(GraphNode {
                    id: row.get(0)?,
                    label: row.get(1)?,
                    node_type: row.get(2)?,
                    content: row.get(3)?,
                    verified: row.get::<_, i32>(4)? != 0,
                    position_x: row.get(5)?,
                    position_y: row.get(6)?,
                    provenance,
                    created_at: row.get::<_, String>(8)?.parse().unwrap_or_else(|_| chrono::Utc::now()),
                    updated_at: row.get::<_, String>(9)?.parse().unwrap_or_else(|_| chrono::Utc::now()),
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        let mut edge_stmt = conn.prepare(
            "SELECT id, source_id, target_id, edge_type, evidence, verified, created_at FROM edges",
        )?;
        let edges = edge_stmt
            .query_map([], |row| {
                Ok(GraphEdge {
                    id: row.get(0)?,
                    source_id: row.get(1)?,
                    target_id: row.get(2)?,
                    edge_type: row.get(3)?,
                    evidence: row.get(4)?,
                    verified: row.get::<_, i32>(5)? != 0,
                    created_at: row.get::<_, String>(6)?.parse().unwrap_or_else(|_| chrono::Utc::now()),
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(GraphSnapshot { nodes, edges })
    }

    pub fn get_node(&self, id: &str) -> Result<GraphNode, StorageError> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT id, label, node_type, content, verified, position_x, position_y, provenance, created_at, updated_at FROM nodes WHERE id = ?1",
            params![id],
            |row| {
                let provenance_str: String = row.get(7)?;
                let provenance = serde_json::from_str(&provenance_str).map_err(|e| {
                    rusqlite::Error::FromSqlConversionFailure(7, rusqlite::types::Type::Text, Box::new(e))
                })?;
                Ok(GraphNode {
                    id: row.get(0)?,
                    label: row.get(1)?,
                    node_type: row.get(2)?,
                    content: row.get(3)?,
                    verified: row.get::<_, i32>(4)? != 0,
                    position_x: row.get(5)?,
                    position_y: row.get(6)?,
                    provenance,
                    created_at: row.get::<_, String>(8)?.parse().unwrap_or_else(|_| chrono::Utc::now()),
                    updated_at: row.get::<_, String>(9)?.parse().unwrap_or_else(|_| chrono::Utc::now()),
                })
            },
        )
        .map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => StorageError::NodeNotFound(id.to_string()),
            other => StorageError::Database(other),
        })
    }

    pub fn search(&self, query: &str, limit: usize) -> Result<Vec<SearchResult>, StorageError> {
        if query.trim().is_empty() {
            return Ok(Vec::new());
        }

        let conn = self.conn.lock().unwrap();
        let fts_query = query
            .split_whitespace()
            .map(|word| format!("\"{}\"", word.replace('"', "")))
            .collect::<Vec<_>>()
            .join(" OR ");

        let mut stmt = conn.prepare(
            "SELECT ns.node_id, ns.label,
                    snippet(node_search, 2, '<mark>', '</mark>', '…', 32) as snippet,
                    rank, n.node_type
             FROM node_search ns
             JOIN nodes n ON n.id = ns.node_id
             WHERE node_search MATCH ?1
             ORDER BY rank
             LIMIT ?2",
        )?;

        let results = stmt
            .query_map(params![fts_query, limit as i64], |row| {
                Ok(SearchResult {
                    node_id: row.get(0)?,
                    label: row.get(1)?,
                    snippet: row.get(2)?,
                    rank: row.get(3)?,
                    node_type: row.get(4)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(results)
    }

    pub fn node_count(&self) -> Result<usize, StorageError> {
        let conn = self.conn.lock().unwrap();
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM nodes", [], |row| row.get(0))?;
        Ok(count as usize)
    }

    pub fn seed_mock_graph(&self) -> Result<(), StorageError> {
        if self.node_count()? > 0 {
            return Ok(());
        }
        let (nodes, edges) = crate::engine::mock::mock_graph();
        for node in &nodes {
            self.insert_node(node)?;
            self.index_node(
                &node.id,
                &node.label,
                node.content.as_deref().unwrap_or(""),
            )?;
        }
        for edge in &edges {
            self.insert_edge(edge)?;
        }
        Ok(())
    }

    pub fn reset_graph(&self) -> Result<(), StorageError> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "DELETE FROM sources; DELETE FROM nodes; DELETE FROM edges; DELETE FROM node_search;",
        )?;
        let (nodes, edges) = crate::engine::mock::mock_graph();
        for node in &nodes {
            self.insert_node(node)?;
            self.index_node(
                &node.id,
                &node.label,
                node.content.as_deref().unwrap_or(""),
            )?;
        }
        for edge in &edges {
            self.insert_edge(edge)?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn seed_and_search_mock_graph() {
        let storage = Storage::open_in_memory().unwrap();
        storage.seed_mock_graph().unwrap();
        assert_eq!(storage.node_count().unwrap(), 5);

        let results = storage.search("knowledge", 10).unwrap();
        assert!(!results.is_empty());
    }
}
