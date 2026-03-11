import React from 'react';
import { useTheme } from '../../ThemeContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    editorCmd: string;
    onEditorChange: (cmd: string) => void;
    alwaysOnTop: boolean;
    onAlwaysOnTopChange: (value: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, editorCmd, onEditorChange, alwaysOnTop, onAlwaysOnTopChange }) => {
    const { theme, setTheme } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div className="modal-content" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Settings</h2>
                </div>

                <div className="form-group">
                    <label>Launcher</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            className={editorCmd === 'code' ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => onEditorChange('code')}
                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                        >
                            VS Code
                        </button>
                        <button
                            type="button"
                            className={editorCmd === 'cursor' ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => onEditorChange('cursor')}
                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                        >
                            Cursor
                        </button>
                        <button
                            type="button"
                            className={editorCmd === 'antigravity' ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => onEditorChange('antigravity')}
                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                        >
                            Antigravity
                        </button>
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Theme</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            className={theme === 'light' ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => setTheme('light')}
                            style={{ flex: 1, padding: '0.75rem', fontSize: '1rem' }}
                        >
                            ☀️ Light
                        </button>
                        <button
                            type="button"
                            className={theme === 'dark' ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => setTheme('dark')}
                            style={{ flex: 1, padding: '0.75rem', fontSize: '1rem' }}
                        >
                            🌙 Dark
                        </button>
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Window Behavior</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', flex: 1 }}>Always on Top</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="button"
                                className={alwaysOnTop ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => onAlwaysOnTopChange(true)}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '4px' }}
                            >
                                On
                            </button>
                            <button
                                type="button"
                                className={!alwaysOnTop ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => onAlwaysOnTopChange(false)}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '4px' }}
                            >
                                Off
                            </button>
                        </div>
                    </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '2rem' }}>
                    <button type="button" onClick={onClose} className="btn-primary" style={{ width: '100%' }}>Done</button>
                </div>
            </div>
        </div>
    );
};
