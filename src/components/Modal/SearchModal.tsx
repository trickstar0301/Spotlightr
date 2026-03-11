import React, { useEffect, useRef, useState } from 'react';
import { Workspace } from '../../types';
import { FaFolder } from 'react-icons/fa';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredFavorites: Workspace[];
    filteredRecents: Workspace[];
    onOpenWorkspace: (path: string) => void;
    focusTrigger?: number;
}

export const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    searchQuery,
    setSearchQuery,
    filteredFavorites,
    filteredRecents,
    onOpenWorkspace,
    focusTrigger = 0,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const allResults = [...filteredFavorites, ...filteredRecents];

    useEffect(() => {
        if (isOpen) {
            setSelectedIndex(0);
            const timer = setTimeout(() => {
                inputRef.current?.focus({ preventScroll: true });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen, focusTrigger]); // Focus when opening OR when trigger changes (focus gained)

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === 'Escape') {
                e.preventDefault(); // Prevent default browser escape behavior which might scroll
                window.scrollTo(0, 0); // Force scroll position to top
                onClose();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % allResults.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
        } else if (e.key === 'Enter') {
            if (e.nativeEvent.isComposing) return; // Prevent opening on IME Japanese conversation confirmation

            if (allResults[selectedIndex]) {
                onOpenWorkspace(allResults[selectedIndex].path);
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay search-modal-overlay" onClick={onClose}>
            <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="search-modal-header">
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-modal-input"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                    />
                </div>

                <div className="search-results-container">
                    {searchQuery && allResults.length === 0 ? (
                        <div className="no-results">No projects found for "{searchQuery}"</div>
                    ) : (
                        <div className="search-list">
                            {filteredFavorites.length > 0 && (
                                <div className="search-list-section">
                                    <div className="search-list-label">Favorites</div>
                                    {filteredFavorites.map((ws, index) => (
                                        <div
                                            key={ws.id}
                                            className={`search-list-item ${index === selectedIndex ? 'selected' : ''}`}
                                            onClick={() => {
                                                onOpenWorkspace(ws.path);
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                        >
                                            <div className="search-item-icon">
                                                {ws.icon && !ws.icon.startsWith('data:image') ? (
                                                    <span>{ws.icon}</span>
                                                ) : ws.icon ? (
                                                    <img src={ws.icon} alt="icon" />
                                                ) : (
                                                    <FaFolder color="#60a5fa" />
                                                )}
                                            </div>
                                            <div className="search-item-info">
                                                <div className="search-item-name">{ws.name}</div>
                                                <div className="search-item-path">{ws.path}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {filteredRecents.length > 0 && (
                                <div className="search-list-section">
                                    <div className="search-list-label">Recent Projects</div>
                                    {filteredRecents.map((ws, index) => {
                                        const actualIndex = filteredFavorites.length + index;
                                        return (
                                            <div
                                                key={ws.id}
                                                className={`search-list-item ${actualIndex === selectedIndex ? 'selected' : ''}`}
                                                onClick={() => {
                                                    onOpenWorkspace(ws.path);
                                                    onClose();
                                                }}
                                                onMouseEnter={() => setSelectedIndex(actualIndex)}
                                            >
                                                <div className="search-item-icon">
                                                    {ws.icon && !ws.icon.startsWith('data:image') ? (
                                                        <span>{ws.icon}</span>
                                                    ) : ws.icon ? (
                                                        <img src={ws.icon} alt="icon" />
                                                    ) : (
                                                        <FaFolder color="#60a5fa" />
                                                    )}
                                                </div>
                                                <div className="search-item-info">
                                                    <div className="search-item-name">{ws.name}</div>
                                                    <div className="search-item-path">{ws.path}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="search-modal-footer">
                    <div className="search-stats">
                        {allResults.length} projects found
                    </div>
                    <div className="search-hints">
                        <span><kbd>↑↓</kbd> to navigate</span>
                        <span><kbd>↵</kbd> to open</span>
                        <span><kbd>ESC</kbd> to close</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
