import React from 'react';
import { Workspace } from '../../types';
import { FaStar, FaRegStar, FaFolder, FaPen } from 'react-icons/fa';

interface WorkspaceTileProps {
    workspace: Workspace;
    onClick: (path: string) => void;
    onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
    onEdit?: (e: React.MouseEvent, workspace: Workspace) => void;
    compact?: boolean;
    isSelected?: boolean;
}

export const WorkspaceTile: React.FC<WorkspaceTileProps> = ({
    workspace,
    onClick,
    onToggleFavorite,
    onEdit,
    compact = false,
    isSelected = false,
}) => {
    const handleTileClick = () => {
        onClick(workspace.path);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite?.(e, workspace.id);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit?.(e, workspace);
    };

    const renderIcon = () => {
        if (workspace.icon) {
            if (workspace.icon.startsWith('data:image')) {
                return (
                    <img
                        src={workspace.icon}
                        alt="icon"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                );
            }
            return <span className="workspace-icon-text">{workspace.icon}</span>;
        }
        return <FaFolder color="#60a5fa" style={{ width: '100%', height: '100%' }} />;
    };

    if (compact) {
        return (
            <div
                className={`glass-panel dock-tile ${isSelected ? 'selected' : ''}`}
                data-workspace-id={workspace.id}
                onClick={handleTileClick}
                title={workspace.name}
            >
                <div className="tile-icon">{renderIcon()}</div>
                <span className="dock-tooltip">{workspace.name}</span>
            </div>
        );
    }

    return (
        <div
            className={`glass-panel workspace-tile ${isSelected ? 'selected' : ''}`}
            data-workspace-id={workspace.id}
            onClick={handleTileClick}
            onContextMenu={workspace.isFavorite ? handleEditClick : undefined}
            title={workspace.isFavorite ? "Right-click to edit" : undefined}
        >
            <div className="tile-icon">{renderIcon()}</div>
            <div className="tile-info">
                <div className="tile-name">{workspace.name}</div>
                <div className="tile-path" title={workspace.path}>{workspace.path}</div>
            </div>
            <div className="tile-actions">
                {workspace.isFavorite && (
                    <button
                        className="edit-btn"
                        onClick={handleEditClick}
                        title="Edit workspace"
                    >
                        <FaPen color="#94a3b8" />
                    </button>
                )}
                <button
                    className={`favorite-btn ${workspace.isFavorite ? 'active' : ''}`}
                    onClick={handleFavoriteClick}
                    title={workspace.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    {workspace.isFavorite ? <FaStar color="#fbbf24" /> : <FaRegStar color="#94a3b8" />}
                </button>
            </div>
        </div>
    );
};
