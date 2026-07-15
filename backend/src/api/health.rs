use axum::{extract::State, Json};
use serde_json::{json, Value};

use super::AppState;

pub async fn health(State(state): State<AppState>) -> Json<Value> {
    let node_count = state.storage.node_count().unwrap_or(0);
    Json(json!({
        "status": "ok",
        "version": "0.1.0",
        "node_count": node_count,
    }))
}
