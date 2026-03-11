use rusqlite::OpenFlags;
use std::env;
use std::path::{Path, PathBuf};

fn get_possible_db_paths() -> Vec<PathBuf> {
    let home = env::var("HOME").unwrap_or_default();
    if home.is_empty() {
        return Vec::new();
    }
    let home_path = PathBuf::from(home);
    
    let mut paths = Vec::new();
    
    // macOS
    if cfg!(target_os = "macos") {
        let mac_base = home_path.join("Library").join("Application Support");
        paths.push(mac_base.join("Code").join("User").join("globalStorage").join("state.vscdb"));
        paths.push(mac_base.join("Cursor").join("User").join("globalStorage").join("state.vscdb"));
    } else if cfg!(target_os = "linux") {
        // Linux
        let linux_base = home_path.join(".config");
        paths.push(linux_base.join("Code").join("User").join("globalStorage").join("state.vscdb"));
        paths.push(linux_base.join("Cursor").join("User").join("globalStorage").join("state.vscdb"));
    }
    
    paths
}

/// Extract a file-system URI string from a VS Code history entry.
/// Returns `folderUri` always, or `fileUri` only for `.code-workspace` files.
fn extract_uri_from_entry(entry: &serde_json::Value) -> Option<&str> {
    if let Some(uri) = entry.get("folderUri").and_then(|v| v.as_str()) {
        return Some(uri);
    }
    if let Some(workspace) = entry.get("workspace") {
        if let Some(config_path) = workspace.get("configPath").and_then(|v| v.as_str()) {
            return Some(config_path);
        }
    }
    let file_uri = entry.get("fileUri").and_then(|v| v.as_str())?;
    file_uri.ends_with(".code-workspace").then_some(file_uri)
}

/// Read all valid local project paths from a single `state.vscdb` file.
/// Any failure (DB locked, missing key, bad JSON, …) simply returns `None`.
fn read_paths_from_db(db_path: &Path) -> Option<Vec<String>> {
    let conn = rusqlite::Connection::open_with_flags(db_path, OpenFlags::SQLITE_OPEN_READ_ONLY).ok()?;
    let json_str: String = conn
        .query_row(
            "SELECT value FROM ItemTable WHERE key = 'history.recentlyOpenedPathsList'",
            [],
            |row| row.get(0),
        )
        .ok()?;

    let parsed: serde_json::Value = serde_json::from_str(&json_str).ok()?;
    let entries = parsed.get("entries")?.as_array()?;

    let paths = entries
        .iter()
        .filter_map(extract_uri_from_entry)
        .filter(|uri| uri.starts_with("file://") || uri.starts_with("vscode-remote://"))
        .filter_map(|uri| {
            if uri.starts_with("vscode-remote://") {
                // If it's a remote URI, skip local existence check, keep the URI formatting intact.
                Some(uri.to_string())
            } else {
                // If it's local file://, strip prefix and check if exists on local machine.
                let local_path = uri.replacen("file://", "", 1);
                if Path::new(&local_path).exists() {
                    Some(local_path)
                } else {
                    None
                }
            }
        })
        .collect();

    Some(paths)
}

#[tauri::command]
pub fn fetch_vscode_recent() -> Result<Vec<String>, String> {
    let mut seen = std::collections::HashSet::new();
    let unique_paths = get_possible_db_paths()
        .into_iter()
        .filter(|p| p.exists())
        .filter_map(|p| read_paths_from_db(&p))
        .flatten()
        .filter(|path| seen.insert(path.clone()))
        .collect();

    Ok(unique_paths)
}
