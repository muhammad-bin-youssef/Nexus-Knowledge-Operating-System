use super::types::{GraphEdge, GraphNode};
use chrono::Utc;
use uuid::Uuid;

pub trait AiProvider {
    fn name(&self) -> &'static str;
    fn classify_node(&self, content: &str) -> String;
    fn extract_entities(&self, content: &str) -> Vec<String>;
    fn summarize(&self, content: &str) -> String;
    fn extract_relations(&self, nodes: &[GraphNode]) -> Vec<GraphEdge>;
}

pub struct MockProvider;

impl MockProvider {
    pub fn new() -> Self {
        Self
    }
}

impl AiProvider for MockProvider {
    fn name(&self) -> &'static str {
        "mock"
    }

    fn classify_node(&self, content: &str) -> String {
        let lower = content.to_lowercase();
        if lower.contains('?')
            || lower.starts_with("who ")
            || lower.starts_with("what ")
            || lower.starts_with("when ")
            || lower.starts_with("where ")
            || lower.starts_with("why ")
            || lower.starts_with("how ")
        {
            "question".to_string()
        } else if lower.contains("because")
            || lower.contains("therefore")
            || lower.contains("as a result")
            || lower.contains("depends on")
        {
            "evidence".to_string()
        } else if content.len() < 80 {
            "claim".to_string()
        } else {
            "concept".to_string()
        }
    }

    fn extract_entities(&self, content: &str) -> Vec<String> {
        content
            .split(|c: char| !c.is_alphanumeric())
            .filter(|token| token.len() > 4)
            .map(str::to_string)
            .take(5)
            .collect()
    }

    fn summarize(&self, content: &str) -> String {
        let first_line = content.lines().next().unwrap_or(content).trim();
        if first_line.is_empty() {
            let trimmed = content.trim();
            if trimmed.len() <= 60 {
                trimmed.to_string()
            } else {
                format!("{}…", &trimmed[..57])
            }
        } else if first_line.len() <= 60 {
            first_line.to_string()
        } else {
            format!("{}…", &first_line[..57])
        }
    }

    fn extract_relations(&self, nodes: &[GraphNode]) -> Vec<GraphEdge> {
        nodes
            .windows(2)
            .map(|pair| GraphEdge {
                id: Uuid::new_v4().to_string(),
                source_id: pair[0].id.clone(),
                target_id: pair[1].id.clone(),
                edge_type: "related_to".to_string(),
                evidence: format!(
                    "The chunk \"{}\" is related to \"{}\".",
                    pair[0].label,
                    pair[1].label,
                ),
                verified: false,
                created_at: Utc::now(),
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::{AiProvider, MockProvider};
    use crate::engine::types::{GraphNode, Provenance};
    use chrono::Utc;

    #[test]
    fn mock_provider_classifies_question_text() {
        let provider = MockProvider::new();
        let node_type = provider.classify_node("What is a knowledge graph?");
        assert_eq!(node_type, "question");
    }

    #[test]
    fn mock_provider_extracts_linked_relations() {
        let provider = MockProvider::new();
        let now = Utc::now();
        let nodes = vec![
            GraphNode {
                id: "a".to_string(),
                label: "First".to_string(),
                node_type: "concept".to_string(),
                content: Some("First chunk".to_string()),
                verified: false,
                position_x: 0.0,
                position_y: 0.0,
                provenance: Provenance {
                    source_id: "s".to_string(),
                    source_type: "mock".to_string(),
                    excerpt: None,
                    offset_start: None,
                    offset_end: None,
                },
                created_at: now,
                updated_at: now,
            },
            GraphNode {
                id: "b".to_string(),
                label: "Second".to_string(),
                node_type: "concept".to_string(),
                content: Some("Second chunk".to_string()),
                verified: false,
                position_x: 0.0,
                position_y: 0.0,
                provenance: Provenance {
                    source_id: "s".to_string(),
                    source_type: "mock".to_string(),
                    excerpt: None,
                    offset_start: None,
                    offset_end: None,
                },
                created_at: now,
                updated_at: now,
            },
        ];

        let edges = provider.extract_relations(&nodes);

        assert_eq!(edges.len(), 1);
        assert_eq!(edges[0].source_id, "a");
        assert_eq!(edges[0].target_id, "b");
        assert_eq!(edges[0].edge_type, "related_to");
    }
}
