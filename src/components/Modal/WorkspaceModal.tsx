import React, { useState, useEffect } from 'react';
import { Workspace } from '../../types';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (workspace: Workspace) => void;
    initialData?: Workspace | null;
}

export const WorkspaceModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<Workspace>>({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({});
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.path) {
            onSave(formData as Workspace);
            onClose();
        }
    };

    const handleSelectImage = async () => {
        try {
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'Image',
                    extensions: ['png', 'jpeg', 'jpg', 'webp', 'svg']
                }]
            });
            if (selected && typeof selected === 'string') {
                const contents = await readFile(selected);
                let mimeType = 'image/png';
                if (selected.toLowerCase().endsWith('.jpg') || selected.toLowerCase().endsWith('.jpeg')) mimeType = 'image/jpeg';
                else if (selected.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
                else if (selected.toLowerCase().endsWith('.svg')) mimeType = 'image/svg+xml';

                let binary = '';
                const bytes = new Uint8Array(contents);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64 = window.btoa(binary);

                setFormData(prev => ({
                    ...prev,
                    icon: `data:${mimeType};base64,${base64}`,
                    iconPath: selected
                }));
            }
        } catch (err) {
            console.error("Failed to select image", err);
        }
    };

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div className="modal-content" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initialData ? 'Edit Workspace' : 'Add Workspace'}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Display Name</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name || ''}
                            placeholder="e.g., Spotlightr Project"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="path">Directory Path</label>
                        <input
                            type="text"
                            id="path"
                            value={formData.path || ''}
                            onChange={e => setFormData({ ...formData, path: e.target.value })}
                            required
                            placeholder="/Users/trickstar/... "
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="icon">Custom Icon (Emoji or Image)</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                id="icon"
                                value={formData.iconPath || formData.icon || ''}
                                onChange={e => {
                                    if (formData.iconPath) {
                                        // If they clear or modify a path, drop the stored image 
                                        setFormData({ ...formData, icon: e.target.value, iconPath: undefined });
                                    } else {
                                        setFormData({ ...formData, icon: e.target.value })
                                    }
                                }}
                                placeholder="e.g., 🚀 or /path/to/icon.png"
                                maxLength={formData.iconPath ? undefined : 2}
                                style={{ flexGrow: 1 }}
                            />
                            <button type="button" onClick={handleSelectImage} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                                Select File
                            </button>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
