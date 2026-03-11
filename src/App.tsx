import { useRef, useState } from 'react';
import { Workspace } from './types';
import { useWorkspaces } from './hooks/useWorkspaces';
import { useWindowLayout } from './hooks/useWindowLayout';
import { useSettings } from './hooks/useSettings';
import { WorkspaceTile } from './components/WorkspaceTile/WorkspaceTile';
import { SortableWorkspaceTile } from './components/WorkspaceTile/SortableWorkspaceTile';
import { WorkspaceModal } from './components/Modal/WorkspaceModal';
import { SettingsModal } from './components/Modal/SettingsModal';
import { QuickActions } from './components/QuickActions/QuickActions';
import { FaCog, FaSearch } from 'react-icons/fa';
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
    isSettingsOpen,
    setIsSettingsOpen,
    handleEditorChange,
    handleAlwaysOnTopChange
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

  const appRef = useRef<HTMLDivElement>(null);

  const filterList = (list: Workspace[]) => {
    if (!searchQuery) return list;
    const lowerQuery = searchQuery.toLowerCase();
    return list.filter(ws =>
      ws.name.toLowerCase().includes(lowerQuery) ||
      ws.path.toLowerCase().includes(lowerQuery)
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
            <div className={`search-container ${isSearchVisible ? 'visible' : ''}`}>
              <input
                type="text"
                className={`search-input ${isSearchVisible ? '' : 'hidden'}`}
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={isSearchVisible}
              />
            </div>
            <button
              onClick={() => {
                setIsSearchVisible(!isSearchVisible);
                if (isSearchVisible) setSearchQuery(''); // Clear logic on close
              }}
              className={`btn-secondary ${isSearchVisible ? 'active' : ''}`}
              aria-label="Search"
              style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Search"
            >
              <FaSearch size={18} color="currentColor" />
            </button>
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
                      onClick={(path) => handleOpenWorkspace(path, editorCmd)}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={handleEditWorkspace}
                      compact={isCompact}
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
              onClick={(path) => handleOpenWorkspace(path, editorCmd)}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleEditWorkspace}
              compact={isCompact}
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
      />
    </div >
  );
}

export default App;
