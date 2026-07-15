mod api;
mod engine;
mod storage;

use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;

use api::{create_router, AppState};
use storage::Storage;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "kos_backend=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let data_dir = std::env::var("KOS_DATA_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("./data"));
    let db_path = data_dir.join("kos.db");

    let storage = Arc::new(
        Storage::open(&db_path).expect("failed to open database"),
    );
    storage
        .seed_mock_graph()
        .expect("failed to seed mock graph");

    let state = AppState { storage };
    let app = create_router(state);

    let port: u16 = std::env::var("KOS_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3001);
    let bind_addr = std::env::var("KOS_BIND_ADDR").unwrap_or_else(|_| "0.0.0.0".into());
    let addr = format!("{bind_addr}:{port}").parse::<SocketAddr>().expect("invalid bind address");

    tracing::info!("Knowledge OS backend listening on http://{addr}");

    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(listener) => listener,
        Err(err) => {
            tracing::error!(%err, port, "failed to bind port");
            eprintln!(
                "Failed to bind backend to http://127.0.0.1:{port}: {err}\nPlease stop the other application using that port or set KOS_PORT to a free port."
            );
            std::process::exit(1);
        }
    };

    if let Err(err) = axum::serve(listener, app).await {
        tracing::error!(%err, "server error");
        eprintln!("Backend server error: {err}");
        std::process::exit(1);
    }
}
