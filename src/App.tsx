import { useState, useEffect, useRef } from "react";
import { Workspace } from './types';
import { useWorkspaces } from './hooks/useWorkspaces';
import { useWindowLayout } from './hooks/useWindowLayout';
import { useSettings } from './hooks/useSettings';
import { WorkspaceTile } from './components/WorkspaceTile/WorkspaceTile';
import { SortableWorkspaceTile } from './components/WorkspaceTile/SortableWorkspaceTile';
import { SearchModal } from './components/Modal/SearchModal';
import { WorkspaceModal } from './components/Modal/WorkspaceModal';
import { SettingsModal } from './components/Modal/SettingsModal';
import { QuickActions } from './components/QuickActions/QuickActions';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { FaCog } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import './App.css';

function App() {
  const { isCompact, isHorizontal } = useWindowLayout();
  const {
    editorCmd,
    alwaysOnTop,
    autoOpenSearch,
    isSettingsOpen,
    setIsSettingsOpen,
    handleEditorChange,
    handleAlwaysOnTopChange,
    handleAutoOpenSearchChange
  } = useSettings();

  const {
    favorites,
    recents,
    isModalOpen,
    setIsModalOpen,
    editingWorkspace,
    handleOpenWorkspace,
    handleToggleFavorite,
    handleEditWorkspace,
    handleSaveWorkspace,
    handleDragEnd,
  } = useWorkspaces();

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [searchFocusTrigger, setSearchFocusTrigger] = useState(0);

  // Handle App Focus (Spotlight-like behavior)
  useEffect(() => {
    const unlisten = getCurrentWindow().onFocusChanged(({ payload: focused }) => {
      if (!focused) {
        // App lost focus (e.g., launched an editor), close search modal
        setIsSearchVisible(false);
        setSearchQuery('');
      } else {
        // App gained focus, just restore scroll position
        window.scrollTo(0, 0);

        if (autoOpenSearch) {
          setIsSearchVisible(true);
          setSearchFocusTrigger(prev => prev + 1);
        }
      }
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, [autoOpenSearch]);

  // Handle Keyboard Navigation and Shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if already in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        isModalOpen || isSettingsOpen || isSearchVisible
      ) {
        if (event.key === 'Escape' && isSearchVisible) {
          window.scrollTo(0, 0); // Restore scroll position to top
          setIsSearchVisible(false);
          setSearchQuery('');
        }
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        window.scrollTo(0, 0); // Restore scroll position to top
        setSearchQuery('');
        setIsSearchVisible(true);
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const tiles = Array.from(document.querySelectorAll<HTMLElement>('.workspace-tile, .dock-tile'));
        if (tiles.length === 0) return;

        const currentIndex = tiles.findIndex(t => t.dataset.workspaceId === selectedWorkspaceId);

        if (currentIndex === -1) {
          setSelectedWorkspaceId(tiles[0].dataset.workspaceId || null);
          tiles[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }

        const currentTile = tiles[currentIndex];
        const currentRect = currentTile.getBoundingClientRect();

        let nextTile: HTMLElement | null = null;

        if (event.key === 'ArrowLeft') {
          if (currentIndex > 0) nextTile = tiles[currentIndex - 1];
        } else if (event.key === 'ArrowRight') {
          if (currentIndex < tiles.length - 1) nextTile = tiles[currentIndex + 1];
        } else if (event.key === 'ArrowUp') {
          const aboveTiles = tiles.filter(t => t.getBoundingClientRect().bottom <= currentRect.top + 10);
          if (aboveTiles.length > 0) {
            const maxBottom = Math.max(...aboveTiles.map(t => t.getBoundingClientRect().bottom));
            const immediateAboveTiles = aboveTiles.filter(t => t.getBoundingClientRect().bottom >= maxBottom - 10);

            const currentCenterX = currentRect.left + currentRect.width / 2;
            let minDx = Infinity;
            for (const t of immediateAboveTiles) {
              const r = t.getBoundingClientRect();
              const centerX = r.left + r.width / 2;
              const dx = Math.abs(centerX - currentCenterX);
              if (dx < minDx) {
                minDx = dx;
                nextTile = t;
              }
            }
          } else {
            nextTile = tiles[0];
          }
        } else if (event.key === 'ArrowDown') {
          const belowTiles = tiles.filter(t => t.getBoundingClientRect().top >= currentRect.bottom - 10);
          if (belowTiles.length > 0) {
            const minTop = Math.min(...belowTiles.map(t => t.getBoundingClientRect().top));
            const immediateBelowTiles = belowTiles.filter(t => t.getBoundingClientRect().top <= minTop + 10);

            const currentCenterX = currentRect.left + currentRect.width / 2;
            let minDx = Infinity;
            for (const t of immediateBelowTiles) {
              const r = t.getBoundingClientRect();
              const centerX = r.left + r.width / 2;
              const dx = Math.abs(centerX - currentCenterX);
              if (dx < minDx) {
                minDx = dx;
                nextTile = t;
              }
            }
          } else {
            nextTile = tiles[tiles.length - 1];
          }
        }

        if (nextTile && nextTile.dataset.workspaceId) {
          setSelectedWorkspaceId(nextTile.dataset.workspaceId);
          nextTile.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      if (event.key === 'Enter') {
        if (selectedWorkspaceId) {
          const combined = [...favorites, ...recents];
          const ws = combined.find(w => w.id === selectedWorkspaceId);
          if (ws) {
            event.preventDefault();
            handleOpenWorkspace(ws.path, editorCmd);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isSettingsOpen, isSearchVisible, selectedWorkspaceId, favorites, recents, handleOpenWorkspace, editorCmd]);

  const appRef = useRef<HTMLDivElement>(null);

  const filterList = (list: Workspace[]) => {
    if (!searchQuery) return list;
    const lowerQuery = searchQuery.toLowerCase();
    return list.filter(ws =>
      ws.name.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredFavorites = filterList(favorites);
  const filteredRecents = filterList(recents);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // minimum distance before drag starts, to allow clicks on buttons
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div ref={appRef} className={`app-container${isCompact ? ' compact' : ''}${isCompact && isHorizontal ? ' horizontal' : ''}`}>

      {!isCompact && (
        <header className="header">
          <h1>Spotlightr</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <QuickActions isCompact={false} />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="btn-secondary"
              aria-label="Settings"
              style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Settings"
            >
              <FaCog size={20} color="currentColor" />
            </button>
          </div>
        </header >
      )
      }

      {
        isCompact && (
          <QuickActions isCompact={true} />
        )
      }

      {
        favorites.length > 0 && (
          <section className="section favorites-section">
            {!isCompact && <h2>Favorites</h2>}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className={isCompact ? 'dock-list' : 'grid'}>
                <SortableContext
                  items={filteredFavorites.map(ws => ws.id)}
                  strategy={rectSortingStrategy}
                >
                  {filteredFavorites.map(ws => (
                    <SortableWorkspaceTile
                      key={ws.id}
                      workspace={ws}
                      onClick={(path) => {
                        setSelectedWorkspaceId(ws.id);
                        handleOpenWorkspace(path, editorCmd);
                      }}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={handleEditWorkspace}
                      compact={isCompact}
                      isSelected={ws.id === selectedWorkspaceId}
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          </section>
        )
      }

      <section className="section recents-section">
        {!isCompact && <h2>Recent Projects</h2>}
        <div className={isCompact ? 'dock-list' : 'grid'}>
          {filteredRecents.map(ws => (
            <WorkspaceTile
              key={ws.id}
              workspace={ws}
              onClick={(path) => {
                setSelectedWorkspaceId(ws.id);
                handleOpenWorkspace(path, editorCmd);
              }}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleEditWorkspace}
              compact={isCompact}
              isSelected={ws.id === selectedWorkspaceId}
            />
          ))}
          {filteredRecents.length === 0 && !isCompact && <p style={{ color: '#64748b' }}>No recent projects found.</p>}
        </div>
      </section>

      <WorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorkspace}
        initialData={editingWorkspace}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        editorCmd={editorCmd}
        onEditorChange={handleEditorChange}
        alwaysOnTop={alwaysOnTop}
        onAlwaysOnTopChange={handleAlwaysOnTopChange}
        autoOpenSearch={autoOpenSearch}
        onAutoOpenSearchChange={handleAutoOpenSearchChange}
      />

      <SearchModal
        isOpen={isSearchVisible}
        onClose={() => {
          setIsSearchVisible(false);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        focusTrigger={searchFocusTrigger}
        filteredFavorites={filteredFavorites}
        filteredRecents={filteredRecents}
        onOpenWorkspace={(path) => handleOpenWorkspace(path, editorCmd)}
      />
    </div >
  );
}

export default App;
