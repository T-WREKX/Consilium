import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CaptureView from '../../../views/capture/CaptureView';

describe('CaptureView', () => {
  it('renders all three tabs', () => {
    render(<CaptureView />);
    expect(screen.getByText('Write')).toBeDefined();
    expect(screen.getByText('Record')).toBeDefined();
    expect(screen.getByText('Upload')).toBeDefined();
  });

  it('shows Write tab content by default', () => {
    render(<CaptureView />);
    expect(screen.getByPlaceholderText('Note title')).toBeDefined();
  });

  it('switches to Record tab on click', () => {
    render(<CaptureView />);
    fireEvent.click(screen.getByText('Record'));
    expect(screen.getByText('Click to record (max 5 min)')).toBeDefined();
  });

  it('switches to Upload tab on click', () => {
    render(<CaptureView />);
    fireEvent.click(screen.getByText('Upload'));
    expect(screen.getByText('Drop an image or click to upload')).toBeDefined();
  });
});
