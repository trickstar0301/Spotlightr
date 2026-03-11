import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import uniqid from 'uniqid';
import { Workspace } from '../types';

export function useWorkspaces() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

    const loadData = async () => {
        try {
            const loadedWorkspaces: Workspace[] = await invoke('load_workspaces');

            let vscodeRecents: string[] = [];
            try {
                vscodeRecents = await invoke('fetch_vscode_recent');
            } catch (e) {
                console.error("Failed to fetch VS Code recents", e);
            }

            const MAX_RECENTS = 20;
            const recentWorkspaces: Workspace[] = vscodeRecents.slice(0, MAX_RECENTS).map(path => {
                let name = path;
                let icon: string | undefined = undefined;

                if (path.startsWith('vscode-remote://')) {
                    const match = path.match(/^vscode-remote:\/\/([^+]+)\+/);
                    const envType = match ? match[1] : 'Remote';

                    let envLabel = 'Remote';
                    if (envType === 'dev-container' || envType === 'attached-container') {
                        envLabel = envType === 'dev-container' ? 'Dev Container' : 'Attached Container';
                        icon = '🐳';
                    } else if (envType === 'ssh-remote') {
                        envLabel = 'SSH';
                        icon = '🌐';
                    } else if (envType === 'wsl') {
                        envLabel = 'WSL';
                        icon = '🐧';
                    }

                    const parts = path.split('/');
                    const folderName = parts[parts.length - 1] || path;
                    name = `${folderName} [${envLabel}]`;
                } else {
                    const parts = path.split(/[/\\]/);
                    name = parts[parts.length - 1] || path;
                }

                // Provide a stable, deterministic ID based on the path to prevent React DOM flickering
                return { id: `auto-${path}`, name, path, isFavorite: false, icon };
            });

            // Keep favorites from localStorage
            const favorites = loadedWorkspaces.filter(w => w.isFavorite);
            const favoritePaths = new Set(favorites.map(w => w.path));

            const merged = [...favorites];

            for (const recent of recentWorkspaces) {
                // If it isn't already a favorite, add it to the list
                if (!favoritePaths.has(recent.path)) {
                    // Look for existing non-favorite entries to preserve their icons if they have one
                    const existing = loadedWorkspaces.find(w => w.path === recent.path && !w.isFavorite);
                    if (existing) {
                        merged.push({ ...recent, icon: existing.icon || recent.icon });
                    } else {
                        merged.push(recent);
                    }
                }
            }

            setWorkspaces(merged);
        } catch (error) {
            console.error('Failed to load workspaces:', error);
        }
    };

    useEffect(() => {
        loadData(); // Initial load

        // Periodic refresh every 10 seconds
        const intervalId = setInterval(() => {
            loadData();
        }, 10000);

        // Refresh when application regains focus
        const onFocus = () => {
            loadData();
        };
        window.addEventListener('focus', onFocus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', onFocus);
        };
    }, []);

    const saveToBackend = async (newWorkspaces: Workspace[]) => {
        try {
            await invoke('save_workspaces', { workspaces: newWorkspaces });
        } catch (error) {
            console.error('Failed to save workspaces:', error);
        }
    };

    const handleOpenWorkspace = async (path: string, editorCmd: string) => {
        try {
            await invoke('open_in_editor', { path, editorCmd });
        } catch (error) {
            console.error('Failed to open workspace:', error);
            alert(`Could not open ${editorCmd}:\n${error}`);
        }
    };

    const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newWorkspaces = workspaces.map(ws => ws.id === id ? { ...ws, isFavorite: !ws.isFavorite } : ws);
        setWorkspaces(newWorkspaces);
        saveToBackend(newWorkspaces);
    };

    const handleEditWorkspace = (e: React.MouseEvent, workspace: Workspace) => {
        e.preventDefault();
        setEditingWorkspace(workspace);
        setIsModalOpen(true);
    };

    const handleSaveWorkspace = (workspaceData: Workspace) => {
        let newWorkspaces;
        if (editingWorkspace) {
            newWorkspaces = workspaces.map(ws => ws.id === editingWorkspace.id ? { ...ws, ...workspaceData } : ws);
        } else {
            newWorkspaces = [...workspaces, { ...workspaceData, id: uniqid(), isFavorite: false }];
        }
        setWorkspaces(newWorkspaces);
        saveToBackend(newWorkspaces);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setWorkspaces((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Asynchronously save to backend so UI doesn't block
                saveToBackend(newItems);
                return newItems;
            });
        }
    };

    const favorites = workspaces.filter(ws => ws.isFavorite);
    const recents = workspaces.filter(ws => !ws.isFavorite).slice(0, 20);

    return {
        workspaces,
        favorites,
        recents,
        isModalOpen,
        setIsModalOpen,
        editingWorkspace,
        setEditingWorkspace,
        handleOpenWorkspace,
        handleToggleFavorite,
        handleEditWorkspace,
        handleSaveWorkspace,
        handleDragEnd,
    };
}
