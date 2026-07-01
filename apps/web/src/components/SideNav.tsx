import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Network, Users, MessageSquare, ChevronLeft, ChevronRight,
  ChevronDown, ChevronRight as ChevronRightSm,
  Plus, FileText, Folder, FolderOpen, Upload, PenLine, Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNoteStore } from '../store/noteStore';
import { RedactionModal } from '../views/publish/RedactionModal';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { ConfirmModal } from './ConfirmModal';
import { showToast } from './Toast';
import type { PersonalNote, NoteFolder } from '../types/index';

type ContextTarget =
  | { kind: 'note'; note: PersonalNote }
  | { kind: 'folder'; folder: NoteFolder; childCount: number };

interface ContextMenuState {
  x: number;
  y: number;
  target: ContextTarget;
}

interface DeleteTarget {
  target: ContextTarget;
}

const TEAM_ITEMS = [
  { path: '/team', label: 'Team Graph', Icon: Users },
  { path: '/chat', label: 'Chat', Icon: MessageSquare },
];

interface NavItemProps {
  path: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function NavItem({ label, Icon, active, collapsed, onClick }: NavItemProps) {
  return (
    <button
      className={`side-nav-item${active ? ' active' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
    >
      {active && (
        <motion.span
          layoutId="side-nav-rail"
          className="side-nav-rail"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <Icon size={18} />
      <span className="side-nav-label">{label}</span>
    </button>
  );
}

interface NoteRowProps {
  note: PersonalNote;
  active: boolean;
  indent: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent, note: PersonalNote) => void;
}

function NoteRow({ note, active, indent, onClick, onContextMenu }: NoteRowProps) {
  return (
    <button
      className={`file-tree-note${active ? ' active' : ''}${indent ? ' indented' : ''}`}
      onClick={onClick}
      onContextMenu={(e) => onContextMenu(e, note)}
      title={note.title || 'Untitled'}
    >
      <FileText size={13} />
      <span className="file-tree-note-title">
        {note.title || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Untitled</span>}
      </span>
    </button>
  );
}

interface FolderRowProps {
  folder: NoteFolder;
  notes: PersonalNote[];
  activeNoteId: string | null;
  expanded: boolean;
  onToggle: () => void;
  onNoteClick: (note: PersonalNote) => void;
  onFolderContextMenu: (e: React.MouseEvent, folder: NoteFolder, childCount: number) => void;
  onNoteContextMenu: (e: React.MouseEvent, note: PersonalNote) => void;
}

function FolderRow({
  folder, notes, activeNoteId, expanded,
  onToggle, onNoteClick, onFolderContextMenu, onNoteContextMenu,
}: FolderRowProps) {
  return (
    <div className="file-tree-folder">
      <button
        className="file-tree-folder-header"
        onClick={onToggle}
        onContextMenu={(e) => onFolderContextMenu(e, folder, notes.length)}
        title={folder.name}
      >
        {expanded
          ? <ChevronDown size={12} className="file-tree-chevron" />
          : <ChevronRightSm size={12} className="file-tree-chevron" />}
        {expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
        <span className="file-tree-folder-name">{folder.name}</span>
        {notes.length > 0 && (
          <span className="file-tree-folder-count">{notes.length}</span>
        )}
      </button>
      {expanded && notes.map(note => (
        <NoteRow
          key={note.id}
          note={note}
          active={activeNoteId === note.id}
          indent
          onClick={() => onNoteClick(note)}
          onContextMenu={onNoteContextMenu}
        />
      ))}
    </div>
  );
}

interface SideNavProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onMobileClose: () => void;
}

export function SideNav({ collapsed, mobileOpen, onToggleCollapsed, onMobileClose }: SideNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    notes, folders, activeNoteId,
    loadNotes, loadFolders,
    saveNote, setActiveNote, createFolder, markNotePublished,
    deleteNote, deleteFolder,
  } = useNoteStore();

  // Local UI state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showRedaction, setShowRedaction] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadNotes();
    loadFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Focus folder input when it appears
  useEffect(() => {
    if (creatingFolder) folderInputRef.current?.focus();
  }, [creatingFolder]);

  function handleNav(path: string) {
    navigate(path);
    onMobileClose();
  }

  function openNoteContextMenu(e: React.MouseEvent, note: PersonalNote) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, target: { kind: 'note', note } });
  }

  function openFolderContextMenu(e: React.MouseEvent, folder: NoteFolder, childCount: number) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, target: { kind: 'folder', folder, childCount } });
  }

  async function performDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.target.kind === 'note') {
      const note = deleteTarget.target.note;
      const result = await deleteNote(note.id);
      if (result.teamError) {
        showToast(`Note removed locally. Team graph: ${result.teamError}`, 'error');
      } else if (result.unpublishedFromTeam) {
        showToast('Note deleted and removed from team graph.', 'success');
      } else {
        showToast('Note deleted.', 'success');
      }
    } else {
      const folder = deleteTarget.target.folder;
      await deleteFolder(folder.id);
      showToast(`Folder "${folder.name}" deleted. Its notes were moved to Unfiled.`, 'success');
    }
    setDeleteTarget(null);
  }

  async function handleNewNote() {
    setDropdownOpen(false);
    const note = await saveNote({
      title: '',
      body: '',
      contentType: 'text',
      extractedEntities: [],
      classification: 'observation',
      isPrivileged: false,
      isPublished: false,
    });
    setActiveNote(note.id);
    navigate('/capture');
    onMobileClose();
  }

  function handleNewFolder() {
    setDropdownOpen(false);
    setCreatingFolder(true);
    setNewFolderName('');
  }

  async function commitNewFolder() {
    const name = newFolderName.trim();
    if (name) {
      const folder = await createFolder(name);
      setExpandedFolders(prev => new Set([...prev, folder.id]));
    }
    setCreatingFolder(false);
    setNewFolderName('');
  }

  function handleFolderKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitNewFolder();
    if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); }
  }

  function toggleFolder(id: string) {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleNoteClick(note: PersonalNote) {
    setActiveNote(note.id);
    navigate('/capture');
    onMobileClose();
  }

  // Build tree: group notes by folder, collect unfiled
  const notesByFolder: Record<string, PersonalNote[]> = {};
  const unfiledNotes: PersonalNote[] = [];

  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  for (const note of sortedNotes) {
    if (note.folderId && folders.find(f => f.id === note.folderId)) {
      if (!notesByFolder[note.folderId]) notesByFolder[note.folderId] = [];
      notesByFolder[note.folderId].push(note);
    } else {
      unfiledNotes.push(note);
    }
  }

  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));

  const activeNote = notes.find(n => n.id === activeNoteId);
  const canPublish = !!(activeNote && !activeNote.isPublished && activeNote.body.trim().length > 0);
  // Only highlight a note row when the user is actually on the capture route.
  const activeNoteIdForHighlight = pathname === '/capture' ? activeNoteId : null;

  const cls = [
    'side-nav',
    collapsed ? 'side-nav--collapsed' : '',
    mobileOpen ? 'side-nav--mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <aside className={cls}>
      {/* ── Collapsed: show icon for Capture + team nav ── */}
      {collapsed ? (
        <>
          <div className="section-label">Personal</div>
          <NavItem
            path="/capture"
            label="Capture"
            Icon={PenLine}
            active={pathname === '/capture'}
            collapsed
            onClick={() => handleNav('/capture')}
          />
          <NavItem
            path="/graph"
            label="Personal Graph"
            Icon={Network}
            active={pathname === '/graph'}
            collapsed
            onClick={() => handleNav('/graph')}
          />
          <div className="side-nav-divider" />
          <div className="section-label">Team</div>
          {TEAM_ITEMS.map(item => (
            <NavItem
              key={item.path}
              {...item}
              collapsed
              active={pathname === item.path}
              onClick={() => handleNav(item.path)}
            />
          ))}
        </>
      ) : (
        <>
          {/* ── Expanded: full file tree ── */}
          <div className="section-label">Personal</div>

          {/* Action bar: + New and Publish */}
          <div className="file-tree-actions">
            <div className="file-tree-new-wrap" ref={dropdownRef}>
              <button
                className="file-tree-btn file-tree-btn--new"
                onClick={() => setDropdownOpen(v => !v)}
                aria-label="New note or folder"
              >
                <Plus size={13} />
                New
                <ChevronDown size={11} style={{ opacity: 0.6 }} />
              </button>
              {dropdownOpen && (
                <div className="file-tree-dropdown">
                  <button className="file-tree-dropdown-item" onClick={handleNewNote}>
                    <FileText size={14} />
                    New Note
                  </button>
                  <button className="file-tree-dropdown-item" onClick={handleNewFolder}>
                    <Folder size={14} />
                    New Folder
                  </button>
                </div>
              )}
            </div>

            <button
              className={`file-tree-btn file-tree-btn--publish${canPublish ? ' enabled' : ''}`}
              onClick={() => canPublish && setShowRedaction(true)}
              disabled={!canPublish}
              title={canPublish ? 'Publish to team graph' : 'Open a note with content to publish'}
            >
              <Upload size={13} />
              Publish
            </button>
          </div>

          {/* File tree */}
          <div className="file-tree">
            {/* New folder inline input */}
            {creatingFolder && (
              <div className="file-tree-new-folder">
                <Folder size={14} />
                <input
                  ref={folderInputRef}
                  className="file-tree-folder-input"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onBlur={commitNewFolder}
                  onKeyDown={handleFolderKeyDown}
                  placeholder="Folder name"
                />
              </div>
            )}

            {/* Folders */}
            {sortedFolders.map(folder => (
              <FolderRow
                key={folder.id}
                folder={folder}
                notes={notesByFolder[folder.id] ?? []}
                activeNoteId={activeNoteIdForHighlight}
                expanded={expandedFolders.has(folder.id)}
                onToggle={() => toggleFolder(folder.id)}
                onNoteClick={handleNoteClick}
                onFolderContextMenu={openFolderContextMenu}
                onNoteContextMenu={openNoteContextMenu}
              />
            ))}

            {/* Unfiled notes */}
            {unfiledNotes.map(note => (
              <NoteRow
                key={note.id}
                note={note}
                active={activeNoteIdForHighlight === note.id}
                indent={false}
                onClick={() => handleNoteClick(note)}
                onContextMenu={openNoteContextMenu}
              />
            ))}

            {/* Empty state */}
            {notes.length === 0 && folders.length === 0 && !creatingFolder && (
              <div className="file-tree-empty">
                No notes yet.<br />Click + New to start.
              </div>
            )}
          </div>

          {/* Personal Graph nav item */}
          <NavItem
            path="/graph"
            label="Personal Graph"
            Icon={Network}
            active={pathname === '/graph'}
            collapsed={false}
            onClick={() => handleNav('/graph')}
          />

          <div className="side-nav-divider" />
          <div className="section-label">Team</div>
          {TEAM_ITEMS.map(item => (
            <NavItem
              key={item.path}
              {...item}
              collapsed={false}
              active={pathname === item.path}
              onClick={() => handleNav(item.path)}
            />
          ))}
        </>
      )}

      <div className="side-nav-footer">
        <button
          className="side-nav-toggle"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Redaction modal — portal-like, renders above everything */}
      {showRedaction && activeNote && (
        <RedactionModal
          note={activeNote}
          onClose={() => setShowRedaction(false)}
          onPublished={(nodeId) => {
            markNotePublished(activeNote.id, nodeId);
            setShowRedaction(false);
          }}
        />
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={buildContextMenuItems(contextMenu.target, (target) => {
            setContextMenu(null);
            setDeleteTarget({ target });
          })}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!deleteTarget}
        destructive
        title={
          deleteTarget?.target.kind === 'folder'
            ? 'Delete this folder?'
            : 'Delete this note?'
        }
        message={deleteTarget ? renderDeleteMessage(deleteTarget.target) : null}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={performDelete}
      />
    </aside>
  );
}

function buildContextMenuItems(
  target: ContextTarget,
  onDeleteClick: (target: ContextTarget) => void
): ContextMenuItem[] {
  return [
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      destructive: true,
      onClick: () => onDeleteClick(target),
    },
  ];
}

function renderDeleteMessage(target: ContextTarget): React.ReactNode {
  if (target.kind === 'note') {
    const title = target.note.title?.trim() || 'Untitled note';
    const published = target.note.isPublished;
    return (
      <>
        <p>
          You are about to delete <strong>{title}</strong>. This cannot be undone.
        </p>
        {published && (
          <p style={{ marginTop: 8 }}>
            This note was published to the team graph — its team-graph entry will also be removed.
          </p>
        )}
      </>
    );
  }
  return (
    <>
      <p>
        You are about to delete the folder <strong>{target.folder.name}</strong>. This cannot be undone.
      </p>
      {target.childCount > 0 && (
        <p style={{ marginTop: 8 }}>
          {target.childCount === 1
            ? 'The 1 note inside will be kept and moved to Unfiled.'
            : `The ${target.childCount} notes inside will be kept and moved to Unfiled.`}
        </p>
      )}
    </>
  );
}
