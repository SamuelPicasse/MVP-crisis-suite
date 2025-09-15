import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CrisisSummary } from './CrisisSummary';

// Mock Supabase client
const mockRpc = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc
  }))
}));

describe('CrisisSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockRpc.mockReturnValue(new Promise(() => {})); // Never resolves

    render(<CrisisSummary />);
    
    expect(screen.getByText('Crisis Summary')).toBeInTheDocument();
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders crisis data when loaded successfully', async () => {
    const mockCrisis = {
      id: '123',
      name: 'Test Crisis',
      status: 'Active',
      start_time: '2023-12-01T10:00:00Z',
      duration: '02:30:00'
    };

    mockRpc.mockResolvedValue({ data: mockCrisis, error: null });

    render(<CrisisSummary />);

    await waitFor(() => {
      expect(screen.getByText('Test Crisis')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });
  });

  it('renders empty state when no crisis exists', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    render(<CrisisSummary />);

    await waitFor(() => {
      expect(screen.getByText('No active crisis')).toBeInTheDocument();
      expect(screen.getByText('System is operating normally')).toBeInTheDocument();
    });
  });

  it('renders error state when API call fails', async () => {
    const mockError = new Error('API Error');
    mockRpc.mockResolvedValue({ data: null, error: mockError });

    render(<CrisisSummary />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load crisis information')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  it('formats duration correctly', async () => {
    const testCases = [
      { duration: '01:30:00', expected: '1h 30m' },
      { duration: '00:45:00', expected: '45m' },
      { duration: '02:00:00', expected: '2h 0m' }
    ];

    for (const { duration, expected } of testCases) {
      const mockCrisis = {
        id: '123',
        name: 'Test Crisis',
        status: 'Active',
        start_time: '2023-12-01T10:00:00Z',
        duration
      };

      mockRpc.mockResolvedValue({ data: mockCrisis, error: null });

      const { rerender } = render(<CrisisSummary />);

      await waitFor(() => {
        expect(screen.getByText(expected)).toBeInTheDocument();
      });

      rerender(<div />); // Clear the component
    }
  });

  it('applies correct status colors', async () => {
    const statusCases = [
      { status: 'Active', expectedClass: 'text-red-600' },
      { status: 'Monitoring', expectedClass: 'text-yellow-600' },
      { status: 'Closed', expectedClass: 'text-green-600' }
    ];

    for (const { status, expectedClass } of statusCases) {
      const mockCrisis = {
        id: '123',
        name: 'Test Crisis',
        status: status as 'Active' | 'Monitoring' | 'Closed',
        start_time: '2023-12-01T10:00:00Z',
        duration: '01:00:00'
      };

      mockRpc.mockResolvedValue({ data: mockCrisis, error: null });

      const { rerender } = render(<CrisisSummary />);

      await waitFor(() => {
        const statusElement = screen.getByText(status);
        expect(statusElement).toHaveClass(expectedClass);
      });

      rerender(<div />); // Clear the component
    }
  });
});