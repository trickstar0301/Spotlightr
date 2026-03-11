import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function useSettings() {
    const [editorCmd, setEditorCmd] = useState<string>(() => {
        return localStorage.getItem('defaultEditor') || 'code';
    });
    const [alwaysOnTop, setAlwaysOnTop] = useState<boolean>(() => {
        return localStorage.getItem('alwaysOnTop') === 'true';
    });
    const [autoOpenSearch, setAutoOpenSearch] = useState<boolean>(() => {
        return localStorage.getItem('autoOpenSearch') === 'true';
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        // Apply alwaysOnTop on window startup
        getCurrentWindow().setAlwaysOnTop(alwaysOnTop).catch(console.error);
    }, [alwaysOnTop]);

    const handleEditorChange = (newCmd: string) => {
        setEditorCmd(newCmd);
        localStorage.setItem('defaultEditor', newCmd);
    };

    const handleAlwaysOnTopChange = async (value: boolean) => {
        setAlwaysOnTop(value);
        localStorage.setItem('alwaysOnTop', String(value));
        try {
            await getCurrentWindow().setAlwaysOnTop(value);
        } catch (e) {
            console.error('Failed to set alwaysOnTop:', e);
        }
    };

    const handleAutoOpenSearchChange = (value: boolean) => {
        setAutoOpenSearch(value);
        localStorage.setItem('autoOpenSearch', String(value));
    };

    return {
        editorCmd,
        alwaysOnTop,
        autoOpenSearch,
        isSettingsOpen,
        setIsSettingsOpen,
        handleEditorChange,
        handleAlwaysOnTopChange,
        handleAutoOpenSearchChange
    };
}
