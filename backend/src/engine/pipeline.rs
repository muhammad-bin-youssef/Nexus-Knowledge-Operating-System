use crate::engine::provider::{AiProvider, MockProvider};
use super::types::{GraphNode, ImportResult, Provenance};
use crate::storage::Storage;
use chrono::Utc;
use uuid::Uuid;

pub struct Pipeline;

impl Pipeline {
    pub fn import_text(
        storage: &Storage,
        title: &str,
        content: &str,
    ) -> Result<ImportResult, crate::storage::StorageError> {
        let source_id = Uuid::new_v4().to_string();
        let now = Utc::now();
        let provider = MockProvider::new();
        let provider_name = provider.name();

        storage.insert_source(&source_id, title, "txt", content)?;

        let chunks = chunk_text(content);
        let mut nodes_created = 0;
        let mut nodes = Vec::new();

        for (index, chunk) in chunks.iter().enumerate() {
            let node_id = Uuid::new_v4().to_string();
            let _entities = provider.extract_entities(chunk);
            let node_type = provider.classify_node(chunk);
            let label = provider.summarize(chunk);
            let node = GraphNode {
                id: node_id.clone(),
                label: label.clone(),
                node_type,
                content: Some(chunk.clone()),
                verified: false,
                position_x: (index as f64 % 4.0) * 280.0 + 100.0,
                position_y: (index as f64 / 4.0).floor() * 180.0 + 100.0,
                provenance: Provenance {
                    source_id: source_id.clone(),
                    source_type: provider_name.to_string(),
                    excerpt: Some(truncate(chunk, 200)),
                    offset_start: Some(chunk_offset(content, chunk)),
                    offset_end: None,
                },
                created_at: now,
                updated_at: now,
            };
            storage.insert_node(&node)?;
            storage.index_node(&node_id, &label, chunk)?;
            nodes.push(node);
            nodes_created += 1;
        }

        let edges = provider.extract_relations(&nodes);
        for edge in &edges {
            storage.insert_edge(edge)?;
        }

        Ok(ImportResult {
            source_id,
            title: title.to_string(),
            chunk_count: chunks.len(),
            nodes_created,
        })
    }
}

fn chunk_text(content: &str) -> Vec<String> {
    let normalized = content
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n");

    if normalized.is_empty() {
        return Vec::new();
    }

    const CHUNK_SIZE: usize = 500;
    let mut chunks = Vec::new();
    let mut current = String::new();

    for paragraph in normalized.split("\n\n") {
        if current.len() + paragraph.len() + 2 > CHUNK_SIZE && !current.is_empty() {
            chunks.push(current.trim().to_string());
            current = String::new();
        }
        if !current.is_empty() {
            current.push_str("\n\n");
        }
        current.push_str(paragraph);
    }

    if !current.trim().is_empty() {
        chunks.push(current.trim().to_string());
    }

    if chunks.is_empty() {
        chunks.push(normalized);
    }

    chunks
}

fn extract_label(chunk: &str, index: usize) -> String {
    let first_line = chunk.lines().next().unwrap_or(chunk);
    let trimmed = first_line.trim();
    if trimmed.len() > 60 {
        format!("{}…", &trimmed[..57])
    } else if trimmed.is_empty() {
        format!("Chunk {}", index + 1)
    } else {
        trimmed.to_string()
    }
}

fn truncate(text: &str, max: usize) -> String {
    if text.len() <= max {
        text.to_string()
    } else {
        format!("{}…", &text[..max])
    }
}

fn chunk_offset(content: &str, chunk: &str) -> i64 {
    content
        .find(chunk)
        .map(|i| i as i64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn chunk_text_splits_long_content() {
        let content = "First paragraph.\n\nSecond paragraph with more detail.\n\nThird.";
        let chunks = chunk_text(content);
        assert!(!chunks.is_empty());
        assert!(chunks.iter().all(|c| !c.is_empty()));
    }

    #[test]
    fn extract_label_truncates_long_lines() {
        let long = "a".repeat(80);
        let label = extract_label(&long, 0);
        assert!(label.ends_with('…'));
        assert!(label.len() <= 60);
    }
}
