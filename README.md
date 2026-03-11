# Spotlightr

A sleek, lightweight desktop dashboard to view and quickly launch your favorite code projects. 

Spotlightr integrates with your local development environment to automatically fetch recently opened projects from **VS Code** and **Cursor**, providing a clean and beautiful interface to launch them instantly.

## Key Features

- **Instant Launcher:** Open projects directly in your preferred editor with a single click.
- **Auto-Sync:** Automatically imports your recently opened projects from VS Code and Cursor.
- **Pin Favorites:** Keep your most important workspaces at the top for easy access.
- **Personalization:** Set custom emoji or image icons for your favorite projects to make them stand out.
- **Custom Launchers:** Choose which editor to use for each workspace globally or individually.
- **Meeting Quick-Switcher (macOS Only):** Seamlessly toggle focus between Microsoft Teams and Google Meet calls. *(Note: If the switcher doesn't respond after granting permission, please restart Google Chrome.)*

## Getting Started

### Installation

Pre-built installers for macOS and Ubuntu are available on the [Releases](../../releases) page.

- **macOS:** Download the `.dmg` file, open it, and drag Spotlightr to your Applications folder.
- **Linux:** Download the `.AppImage` or `.deb` file.

### ⚠️ macOS: "App is damaged" warning

Because the app is self-published, macOS may show a warning that the app is "damaged and can't be opened." This is a security feature for unsigned apps.

**How to fix:**
Open your terminal and run the following command to allow the app to run:

```bash
xattr -cr /Applications/Spotlightr.app
```

Then you can open the app normally.

## License

This project is licensed under the MIT License.
