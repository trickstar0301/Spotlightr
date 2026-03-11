mod workspace;
mod editor;
mod vscode;
mod applescript;

pub use workspace::Workspace;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            editor::open_in_editor,
            workspace::load_workspaces,
            workspace::save_workspaces,
            vscode::fetch_vscode_recent,
            applescript::focus_google_meet,
            applescript::focus_ms_teams
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
