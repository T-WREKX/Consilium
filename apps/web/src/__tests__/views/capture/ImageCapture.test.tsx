import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageCapture from '../../../views/capture/ImageCapture';

// Fix 10: Extract mocks so they're accessible for assertions
const mockSaveNote = vi.fn().mockResolvedValue({ id: 'new-id' });
const mockAnalyzeImage = vi.fn().mockResolvedValue({ data: { text: 'Extracted text', description: 'A document' } });

vi.mock('../../../api/client', () => ({
  analyzeImage: (...args: unknown[]) => mockAnalyzeImage(...args),
}));
vi.mock('../../../store/noteStore', () => ({
  useNoteStore: () => ({ saveNote: mockSaveNote }),
}));

describe('ImageCapture', () => {
  // Fix 10: Reset mocks before each test
  beforeEach(() => {
    mockSaveNote.mockClear();
    mockAnalyzeImage.mockClear();
    mockAnalyzeImage.mockResolvedValue({ data: { text: 'Extracted text', description: 'A document' } });
  });

  // Fix 11: Remove .toBeDefined() tautology from original tests
  it('renders the drop zone in idle state', () => {
    render(<ImageCapture />);
    screen.getByText('Drop an image or click to upload');
    screen.getByText('PNG, JPG, WebP · max 10MB');
  });

  it('shows error for oversized file', () => {
    render(<ImageCapture />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    // Fix 12: Use tiny buffer and override size property
    const bigFile = new File(['x'], 'big.png', { type: 'image/png' });
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [bigFile] } });
    screen.getByText('File must be under 10MB.');
  });

  it('shows error for unsupported file type', () => {
    render(<ImageCapture />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const badFile = new File(['data'], 'file.gif', { type: 'image/gif' });
    fireEvent.change(input, { target: { files: [badFile] } });
    screen.getByText('Only PNG, JPG, and WebP files are accepted.');
  });

  // Fix 10: Success path test
  it('shows editing state with extracted text after successful analysis', async () => {
    render(<ImageCapture />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await screen.findByText('Extracted text — edit before saving');
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Extracted text');
  });

  // Fix 10: Save path test
  it('calls saveNote with correct payload when Save note is clicked', async () => {
    render(<ImageCapture />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await screen.findByText('Extracted text — edit before saving');
    fireEvent.click(screen.getByText('Save note'));
    await vi.waitFor(() => expect(mockSaveNote).toHaveBeenCalledWith(expect.objectContaining({
      title: 'photo',
      body: 'Extracted text',
      contentType: 'image',
      classification: 'observation',
    })));
  });

  // Fix 10: API error test
  it('shows error message when image analysis fails', async () => {
    mockAnalyzeImage.mockResolvedValue({ error: { code: '500', message: 'Server error', retryable: false } });
    render(<ImageCapture />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await screen.findByText('Image analysis failed. Try again.');
  });

  // Fix 10: Discard path test
  it('returns to idle state when Discard is clicked', async () => {
    render(<ImageCapture />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await screen.findByText('Extracted text — edit before saving');
    fireEvent.click(screen.getByText('Discard'));
    screen.getByText('Drop an image or click to upload');
  });
});
