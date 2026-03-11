import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WorkspaceTile } from './WorkspaceTile';
import { Workspace } from '../../types';

interface SortableWorkspaceTileProps {
    workspace: Workspace;
    onClick: (path: string) => void;
    onToggleFavorite: (e: React.MouseEvent, id: string) => void;
    onEdit: (e: React.MouseEvent, workspace: Workspace) => void;
    compact?: boolean;
    isSelected?: boolean;
}

export const SortableWorkspaceTile: React.FC<SortableWorkspaceTileProps> = ({
    workspace,
    onClick,
    onToggleFavorite,
    onEdit,
    compact = false,
    isSelected = false,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: workspace.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        // Ensure the tile container acts as the drag handle
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <WorkspaceTile
                workspace={workspace}
                onClick={onClick}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEdit}
                compact={compact}
                isSelected={isSelected}
            />
        </div>
    );
};
