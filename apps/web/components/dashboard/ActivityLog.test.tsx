import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ActivityLog } from './ActivityLog';

// Mock Supabase client
const mockRpc = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc
  }))
}));

describe('ActivityLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockRpc.mockReturnValue(new Promise(() => {})); // Never resolves

    render(<ActivityLog />);
    
    expect(screen.getByText('Activity Log')).toBeInTheDocument();
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders activities when loaded successfully', async () => {
    const mockActivities = [
      {
        id: '1',
        crisis_id: 'crisis-1',
        timestamp: '2023-12-01T10:00:00Z',
        description: 'Crisis initiated'
      },
      {
        id: '2',
        crisis_id: 'crisis-1',
        timestamp: '2023-12-01T10:30:00Z',
        description: 'Team assigned'
      }
    ];

    mockRpc.mockResolvedValue({ data: mockActivities, error: null });

    render(<ActivityLog />);

    await waitFor(() => {
      expect(screen.getByText('Crisis initiated')).toBeInTheDocument();
      expect(screen.getByText('Team assigned')).toBeInTheDocument();
    });
  });

  it('renders empty state when no activities exist', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    render(<ActivityLog />);

    await waitFor(() => {
      expect(screen.getByText('No activities recorded')).toBeInTheDocument();
      expect(screen.getByText('Activity will appear here as events occur')).toBeInTheDocument();
    });
  });

  it('renders error state when API call fails', async () => {
    const mockError = new Error('API Error');
    mockRpc.mockResolvedValue({ data: null, error: mockError });

    render(<ActivityLog />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load activity log')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  it('calls API with correct parameters', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    render(<ActivityLog />);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('get_activity_log', {
        p_limit: 20,
        p_offset: 0
      });
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    const mockActivities = [
      {
        id: '1',
        crisis_id: 'crisis-1',
        timestamp: '2023-12-01T10:00:00Z',
        description: 'Test activity'
      }
    ];

    mockRpc.mockResolvedValue({ data: mockActivities, error: null });

    render(<ActivityLog />);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    // Clear the mock to verify it's called again
    mockRpc.mockClear();
    
    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledTimes(1);
    });
  });

  it('formats timestamps correctly', async () => {
    // Mock the Date constructor to return a fixed time for consistent testing
    const fixedTime = new Date('2023-12-01T12:00:00Z');
    const originalDate = Date;
    vi.spyOn(global, 'Date').mockImplementation((...args: ConstructorParameters<typeof Date>) => {
      if (args.length === 0) {
        return fixedTime;
      }
      return new originalDate(...args);
    });

    const mockActivities = [
      {
        id: '1',
        crisis_id: 'crisis-1',
        timestamp: '2023-12-01T11:59:00Z', // 1 minute ago
        description: 'Recent activity'
      },
      {
        id: '2',
        crisis_id: 'crisis-1',
        timestamp: '2023-12-01T11:00:00Z', // 1 hour ago
        description: 'Hour old activity'
      },
      {
        id: '3',
        crisis_id: 'crisis-1',
        timestamp: '2023-11-30T12:00:00Z', // 1 day ago
        description: 'Day old activity'
      }
    ];

    mockRpc.mockResolvedValue({ data: mockActivities, error: null });

    render(<ActivityLog />);

    await waitFor(() => {
      expect(screen.getByText('1m ago')).toBeInTheDocument();
      expect(screen.getByText('1h ago')).toBeInTheDocument();
      expect(screen.getByText('1d ago')).toBeInTheDocument();
    });

    vi.restoreAllMocks();
  });

  it('shows full timestamp on hover', async () => {
    // Mock the Date constructor to return a fixed time for consistent testing
    const fixedTime = new Date('2023-12-01T12:00:00Z');
    const originalDate = Date;
    vi.spyOn(global, 'Date').mockImplementation((...args: ConstructorParameters<typeof Date>) => {
      if (args.length === 0) {
        return fixedTime;
      }
      return new originalDate(...args);
    });

    const mockActivities = [
      {
        id: '1',
        crisis_id: 'crisis-1',
        timestamp: '2023-12-01T11:00:00Z', // 1 hour ago
        description: 'Test activity'
      }
    ];

    mockRpc.mockResolvedValue({ data: mockActivities, error: null });

    render(<ActivityLog />);

    await waitFor(() => {
      const timeElement = screen.getByText('1h ago');
      expect(timeElement).toHaveAttribute('title');
      expect(timeElement.getAttribute('title')).toContain('12/1/2023');
    });

    vi.restoreAllMocks();
  });

  it('uses crisisId and limit props when provided', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    render(<ActivityLog crisisId="test-crisis" limit={10} />);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('get_activity_log', {
        p_crisis_id: 'test-crisis',
        p_limit: 10,
        p_offset: 0
      });
    });
  });
});