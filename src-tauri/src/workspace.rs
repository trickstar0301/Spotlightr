use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub path: String,
    #[serde(rename = "isFavorite")]
    pub is_favorite: bool,
    pub icon: Option<String>,
}

fn get_config_path() -> PathBuf {
    let home = env::var("HOME").expect("Could not find HOME directory");
    let mut path = PathBuf::from(home);
    path.push(".spotlightr_workspaces.json");
    path
}

#[tauri::command]
pub fn load_workspaces() -> Result<Vec<Workspace>, String> {
    let config_path = get_config_path();
    if !config_path.exists() {
        return Ok(Vec::new());
    }

    match fs::read_to_string(&config_path) {
        Ok(contents) => match serde_json::from_str(&contents) {
            Ok(workspaces) => Ok(workspaces),
            Err(e) => Err(format!("Failed to parse config: {}", e)),
        },
        Err(e) => Err(format!("Failed to read config file: {}", e)),
    }
}

#[tauri::command]
pub fn save_workspaces(workspaces: Vec<Workspace>) -> Result<(), String> {
    let config_path = get_config_path();
    match serde_json::to_string_pretty(&workspaces) {
        Ok(json) => match fs::write(config_path, json) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to write config file: {}", e)),
        },
        Err(e) => Err(format!("Failed to serialize workspaces: {}", e)),
    }
}
