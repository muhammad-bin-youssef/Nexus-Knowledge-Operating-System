use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    Json,
};
use crate::engine::types::ImportResult;

use super::AppState;

pub async fn import_txt(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<ImportResult>, StatusCode> {
    let mut filename = String::from("import.txt");
    let mut content = String::new();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| StatusCode::BAD_REQUEST)?
    {
        let name = field.name().unwrap_or("").to_string();
        if name == "file" {
            if let Some(file_name) = field.file_name() {
                filename = file_name.to_string();
            }
            let bytes = field
                .bytes()
                .await
                .map_err(|_| StatusCode::BAD_REQUEST)?;
            content = String::from_utf8(bytes.to_vec()).map_err(|_| StatusCode::BAD_REQUEST)?;
        }
    }

    if content.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let result = crate::engine::import::import_txt(&state.storage, &filename, &content)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(result))
}
