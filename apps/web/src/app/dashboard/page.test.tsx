import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardPage from './page';

// Mock the Supabase client
const mockSignOut = vi.fn();
const mockRpc = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut
    },
    rpc: mockRpc
  })
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  })
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
    mockRpc.mockReturnValue({
      single: () => Promise.resolve({ data: null, error: new Error('Mock error') })
    });
  });

  it('renders dashboard with logout button', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Crisis Management Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Crisis Summary')).toBeInTheDocument();
    expect(screen.getByText('Activity Log')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('handles logout successfully', async () => {
    render(<DashboardPage />);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('displays placeholder widgets', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Incident Location')).toBeInTheDocument();
    expect(screen.getByText('Location widget will be implemented in future stories')).toBeInTheDocument();
    expect(screen.getByText('My Tasks')).toBeInTheDocument();
    expect(screen.getByText('Task widget will be implemented in future stories')).toBeInTheDocument();
  });
});