use super::types::{GraphEdge, GraphNode, Provenance};
use chrono::Utc;
use uuid::Uuid;

pub fn mock_graph() -> (Vec<GraphNode>, Vec<GraphEdge>) {
    let now = Utc::now();
    let source_id = "mock-source".to_string();

    let nodes = vec![
        GraphNode {
            id: "node-knowledge".to_string(),
            label: "Knowledge Graph".to_string(),
            node_type: "concept".to_string(),
            content: Some(
                "A knowledge graph represents entities and their relationships.".to_string(),
            ),
            verified: true,
            position_x: 400.0,
            position_y: 200.0,
            provenance: Provenance {
                source_id: source_id.clone(),
                source_type: "mock".to_string(),
                excerpt: None,
                offset_start: None,
                offset_end: None,
            },
            created_at: now,
            updated_at: now,
        },
        GraphNode {
            id: "node-entity".to_string(),
            label: "Entity Extraction".to_string(),
            node_type: "topic".to_string(),
            content: Some("Identifies named entities from unstructured text.".to_string()),
            verified: true,
            position_x: 150.0,
            position_y: 100.0,
            provenance: Provenance {
                source_id: source_id.clone(),
                source_type: "mock".to_string(),
                excerpt: None,
                offset_start: None,
                offset_end: None,
            },
            created_at: now,
            updated_at: now,
        },
        GraphNode {
            id: "node-relation".to_string(),
            label: "Relation Discovery".to_string(),
            node_type: "topic".to_string(),
            content: Some("Discovers typed relationships between entities.".to_string()),
            verified: true,
            position_x: 650.0,
            position_y: 100.0,
            provenance: Provenance {
                source_id: source_id.clone(),
                source_type: "mock".to_string(),
                excerpt: None,
                offset_start: None,
                offset_end: None,
            },
            created_at: now,
            updated_at: now,
        },
        GraphNode {
            id: "node-claim".to_string(),
            label: "Graph is Source of Truth".to_string(),
            node_type: "claim".to_string(),
            content: Some("The knowledge engine owns the graph; LLMs are adapters.".to_string()),
            verified: false,
            position_x: 400.0,
            position_y: 400.0,
            provenance: Provenance {
                source_id: source_id.clone(),
                source_type: "mock".to_string(),
                excerpt: None,
                offset_start: None,
                offset_end: None,
            },
            created_at: now,
            updated_at: now,
        },
        GraphNode {
            id: "node-evidence".to_string(),
            label: "Project Constitution".to_string(),
            node_type: "evidence".to_string(),
            content: Some("Defines the Knowledge Operating System architecture.".to_string()),
            verified: true,
            position_x: 150.0,
            position_y: 400.0,
            provenance: Provenance {
                source_id,
                source_type: "mock".to_string(),
                excerpt: Some("The LLM is not the brain.".to_string()),
                offset_start: Some(0),
                offset_end: None,
            },
            created_at: now,
            updated_at: now,
        },
    ];

    let edges = vec![
        GraphEdge {
            id: Uuid::new_v4().to_string(),
            source_id: "node-entity".to_string(),
            target_id: "node-knowledge".to_string(),
            edge_type: "supports".to_string(),
            evidence: "Entity extraction feeds the knowledge graph.".to_string(),
            verified: true,
            created_at: now,
        },
        GraphEdge {
            id: Uuid::new_v4().to_string(),
            source_id: "node-relation".to_string(),
            target_id: "node-knowledge".to_string(),
            edge_type: "supports".to_string(),
            evidence: "Relations connect entities into a graph.".to_string(),
            verified: true,
            created_at: now,
        },
        GraphEdge {
            id: Uuid::new_v4().to_string(),
            source_id: "node-evidence".to_string(),
            target_id: "node-claim".to_string(),
            edge_type: "supports".to_string(),
            evidence: "Constitution states graph is source of truth.".to_string(),
            verified: true,
            created_at: now,
        },
        GraphEdge {
            id: Uuid::new_v4().to_string(),
            source_id: "node-claim".to_string(),
            target_id: "node-knowledge".to_string(),
            edge_type: "defines".to_string(),
            evidence: "Core architectural principle.".to_string(),
            verified: false,
            created_at: now,
        },
    ];

    (nodes, edges)
}
