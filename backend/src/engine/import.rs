use super::pipeline::Pipeline;
use crate::storage::Storage;

pub fn import_txt(
    storage: &Storage,
    filename: &str,
    content: &str,
) -> Result<super::types::ImportResult, crate::storage::StorageError> {
    let title = filename
        .strip_suffix(".txt")
        .or_else(|| filename.strip_suffix(".md"))
        .unwrap_or(filename)
        .to_string();
    Pipeline::import_text(storage, &title, content)
}
