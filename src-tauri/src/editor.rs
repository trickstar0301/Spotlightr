use std::path::Path;
use std::process::Command;

/// macOS app bundle names for each allowed editor CLI command.
/// Used with `open -a "App Name"` which relies on Launch Services —
/// no PATH required and works regardless of where the app is installed.
#[cfg(target_os = "macos")]
fn macos_app_name(cmd: &str) -> Option<&'static str> {
    match cmd {
        "code"        => Some("Visual Studio Code"),
        "cursor"      => Some("Cursor"),
        "antigravity" => Some("Antigravity"),
        _             => None,
    }
}

/// On Linux (and as fallback), search well-known binary directories.
fn resolve_editor_path(cmd: &str) -> String {
    let search_dirs = [
        "/opt/homebrew/bin",  // macOS Apple Silicon (Homebrew)
        "/usr/local/bin",     // macOS Intel / standard Linux
        "/usr/bin",
        "/bin",
        "/snap/bin",          // Ubuntu snap
    ];

    for dir in &search_dirs {
        let full = format!("{}/{}", dir, cmd);
        if Path::new(&full).exists() {
            return full;
        }
    }

    cmd.to_string()
}

#[tauri::command]
pub fn open_in_editor(path: String, editor_cmd: String) -> Result<(), String> {
    // --- Security: allowlist the editor command ---
    const ALLOWED_EDITORS: &[&str] = &["code", "cursor", "antigravity"];
    if !ALLOWED_EDITORS.contains(&editor_cmd.as_str()) {
        return Err(format!(
            "Editor '{}' is not allowed. Allowed values: {}",
            editor_cmd,
            ALLOWED_EDITORS.join(", ")
        ));
    }

    // --- Security: basic path sanity check ---
    if path.is_empty() || path.contains('\0') {
        return Err("Invalid path".to_string());
    }

    let is_uri = path.starts_with("vscode-remote://");
    let is_workspace = path.ends_with(".code-workspace");
    
    // Support VS Code's CLI flags for URIs across all supported editors
    let uri_arg = if is_workspace { "--file-uri" } else { "--folder-uri" };

    // macOS: use `open -a "App Name" <path>` via Launch Services (no PATH needed)
    #[cfg(target_os = "macos")]
    if let Some(app_name) = macos_app_name(&editor_cmd) {
        // Antigravity's remote extension host currently crashes when attempting 
        // to load a Dev Container or remote workspace. Stop it before it crashes.
        if editor_cmd == "antigravity" && is_uri {
            return Err("Antigravity currently does not support Remote Workspaces or Dev Containers.".to_string());
        }

        let mut cmd = Command::new("open");
        cmd.args(["-a", app_name]);
        if is_uri {
            cmd.args(["--args", uri_arg, &path]);
        } else {
            cmd.arg(&path);
        }
        
        return cmd.spawn()
            .map(|_| ())
            .map_err(|e| format!("Could not open {}: {}", editor_cmd, e));
    }

    // Linux (or macOS fallback if app_name not found): search known dirs
    let resolved = resolve_editor_path(&editor_cmd);
    // Same guard for Linux fallback
    if editor_cmd == "antigravity" && is_uri {
        return Err("Antigravity currently does not support Remote Workspaces or Dev Containers.".to_string());
    }
    
    let mut cmd = Command::new(&resolved);
    if is_uri {
        cmd.args([uri_arg, &path]);
    } else {
        cmd.arg(&path);
    }
    
    cmd.spawn()
        .map(|_| ())
        .map_err(|e| format!("Could not open {}: Failed to launch {}: {}", path, editor_cmd, e))
}
