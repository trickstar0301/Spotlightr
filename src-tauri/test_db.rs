use rusqlite::Connection;
use serde_json::Value;

fn main() {
    let db_path = "/Users/trickstar/Library/Application Support/Code/User/globalStorage/state.vscdb";
    let conn = Connection::open(db_path).unwrap();
    let json_str: String = conn.query_row(
        "SELECT value FROM ItemTable WHERE key = 'history.recentlyOpenedPathsList'",
        [],
        |row| row.get(0),
    ).unwrap();

    let parsed: Value = serde_json::from_str(&json_str).unwrap();
    let entries = parsed.get("entries").unwrap().as_array().unwrap();

    for entry in entries.iter().take(5) {
        println!("Entry: {:?}", entry);
        let uri = if let Some(u) = entry.get("folderUri").and_then(|v| v.as_str()) {
            Some(u)
        } else if let Some(w) = entry.get("workspace") {
            w.get("configPath").and_then(|v| v.as_str())
        } else {
            let file_uri = entry.get("fileUri").and_then(|v| v.as_str());
            file_uri.filter(|v| v.ends_with(".code-workspace"))
        };
        println!("  -> Extracted: {:?}", uri);
    }
}
