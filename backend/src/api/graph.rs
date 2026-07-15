use axum::{extract::State, http::StatusCode, Json};

use crate::engine::types::GraphSnapshot;

use super::AppState;

pub async fn get_graph(State(state): State<AppState>) -> Json<GraphSnapshot> {
    let graph = state.storage.get_graph().unwrap_or(GraphSnapshot {
        nodes: vec![],
        edges: vec![],
    });
    Json(graph)
}

pub async fn reset_graph(State(state): State<AppState>) -> StatusCode {
    match state.storage.reset_graph() {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

pub async fn get_node(
    State(state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<crate::engine::types::GraphNode>, axum::http::StatusCode> {
    state
        .storage
        .get_node(&id)
        .map(Json)
        .map_err(|_| axum::http::StatusCode::NOT_FOUND)
}
