use axum::extract::{Query, State};
use axum::Json;
use serde::Deserialize;

use crate::engine::types::SearchResult;

use super::AppState;

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: String,
    #[serde(default = "default_limit")]
    pub limit: usize,
}

fn default_limit() -> usize {
    20
}

pub async fn search(
    State(state): State<AppState>,
    Query(params): Query<SearchQuery>,
) -> Json<Vec<SearchResult>> {
    let results = state.storage.search(&params.q, params.limit).unwrap_or_default();
    Json(results)
}
