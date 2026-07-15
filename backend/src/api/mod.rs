mod graph;
mod health;
mod import;
mod search;

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

use crate::storage::Storage;

#[derive(Clone)]
pub struct AppState {
    pub storage: Arc<Storage>,
}

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/api/health", get(health::health))
        .route("/api/graph", get(graph::get_graph))
        .route("/api/graph/nodes/{id}", get(graph::get_node))
        .route("/api/graph/reset", post(graph::reset_graph))
        .route("/api/search", get(search::search))
        .route("/api/import/txt", post(import::import_txt))
        .layer(cors)
        .with_state(state)
}
