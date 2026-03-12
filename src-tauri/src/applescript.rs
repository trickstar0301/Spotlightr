use std::process::Command;

/// Run an AppleScript string and return its trimmed stdout.
#[cfg(target_os = "macos")]
fn run_applescript(script: &str) -> Result<String, String> {
    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()
        .map_err(|e| format!("Failed to run osascript: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(stdout)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        Err(if stderr.is_empty() {
            "osascript exited with non-zero status".to_string()
        } else {
            stderr
        })
    }
}

/// Focus the first Google Chrome tab whose URL contains `url_keyword`.
#[cfg(target_os = "macos")]
fn focus_chrome_tab(url_keyword: &str) -> Result<String, String> {
    // More aggressive AppleScript that tries multiple targeting methods
    let script = format!(
        r#"
set kw to "{}"
try
    tell application "Google Chrome"
        set windowList to every window
        repeat with w in windowList
            set tabList to every tab of w
            set j to 1
            repeat with t in tabList
                set theURL to URL of t as string
                if theURL contains kw then
                    set active tab index of w to j
                    set index of w to 1
                    activate
                    return theURL
                end if
                set j to j + 1
            end repeat
        end repeat
        return "DIAG: Tab not found"
    end tell
on error err
    return "ERROR: " & err
end try
"#,
        url_keyword
    );

    let result = run_applescript(&script)?;
    if result.starts_with("DIAG:") {
        Err(format!("No Chrome tab found containing '{}'", url_keyword))
    } else if result.starts_with("ERROR:") {
        Err(result)
    } else {
        Ok(result)
    }
}

#[cfg(target_os = "macos")]
#[tauri::command]
pub fn focus_google_meet() -> Result<String, String> {
    focus_chrome_tab("meet.google.com")
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
pub fn focus_google_meet() -> Result<String, String> {
    Err("This feature is only supported on macOS.".to_string())
}

#[cfg(target_os = "macos")]
#[tauri::command]
pub fn focus_ms_teams() -> Result<String, String> {
    focus_chrome_tab("teams.microsoft.com")
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
pub fn focus_ms_teams() -> Result<String, String> {
    Err("This feature is only supported on macOS.".to_string())
}

#[cfg(target_os = "macos")]
#[tauri::command]
pub fn focus_google_calendar() -> Result<String, String> {
    focus_chrome_tab("calendar.google.com")
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
pub fn focus_google_calendar() -> Result<String, String> {
    Err("This feature is only supported on macOS.".to_string())
}
