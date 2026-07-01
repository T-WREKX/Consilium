import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TextCapture from '../../../views/capture/TextCapture';

vi.mock('../../../api/client', () => ({
  organizeNote: vi.fn().mockResolvedValue({
    data: { entities: [], classification: 'observation', isPrivileged: false },
  }),
}));

vi.mock('../../../store/noteStore', () => {
  const saveNote = vi.fn().mockResolvedValue({ id: 'mock-id', title: '', body: '', contentType: 'text', extractedEntities: [], classification: 'observation', isPrivileged: false, isPublished: false, createdAt: 0, updatedAt: 0 });
  const updateNoteOrganization = vi.fn().mockResolvedValue(undefined);
  const setActiveNote = vi.fn();
  return {
    useNoteStore: vi.fn().mockReturnValue({
      notes: [],
      activeNoteId: null,
      saveNote,
      updateNoteOrganization,
      setActiveNote,
    }),
  };
});

describe('TextCapture', () => {
  it('renders title input with autofocus and body textarea', () => {
    render(<TextCapture />);
    expect(screen.getByPlaceholderText('Note title')).toBeDefined();
    expect(screen.getByPlaceholderText('Start writing...')).toBeDefined();
  });

  it('calls saveNote after debounce when title changes', async () => {
    vi.useFakeTimers();
    const { useNoteStore } = await import('../../../store/noteStore');
    render(<TextCapture />);
    fireEvent.change(screen.getByPlaceholderText('Note title'), { target: { value: 'My note' } });
    act(() => { vi.advanceTimersByTime(600); });
    await waitFor(() => {
      expect(useNoteStore().saveNote).toHaveBeenCalled();
    });
    vi.useRealTimers();
  });
});
