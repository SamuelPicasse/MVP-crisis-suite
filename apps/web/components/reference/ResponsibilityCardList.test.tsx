import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ResponsibilityCardList } from './ResponsibilityCardList';

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  rpc: vi.fn()
};

const mockReferenceApi = {
  getResponsibilityCards: vi.fn()
};

// Mock the modules
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}));

vi.mock('@crisis-suite/db', () => ({
  createReferenceApiClient: () => mockReferenceApi
}));

const mockResponsibilityCards = [
  {
    id: '1',
    role: 'Crisis Manager',
    duties: ['Overall incident command', 'Strategic decisions'],
    description: 'Primary leadership role',
    created_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: '2',
    role: 'Operations Lead',
    duties: ['Manage operations', 'Coordinate field teams'],
    description: 'Tactical operations',
    created_at: new Date('2024-01-01T00:00:00Z')
  }
];

const mockUser = {
  user: {
    id: 'user-1',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      role: 'Crisis Manager'
    }
  }
};

describe('ResponsibilityCardList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockSupabase.auth.getUser.mockReturnValue(new Promise(() => {}));
    mockReferenceApi.getResponsibilityCards.mockReturnValue(new Promise(() => {}));

    render(<ResponsibilityCardList />);

    expect(screen.getByText('Responsibility Cards')).toBeInTheDocument();
    expect(screen.getByTestId('loading') || screen.getByText(/loading/i) || document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders responsibility cards with user role highlighted', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser, error: null });
    mockReferenceApi.getResponsibilityCards.mockResolvedValue(mockResponsibilityCards);

    render(<ResponsibilityCardList />);

    await waitFor(() => {
      expect(screen.getByText('Crisis Manager')).toBeInTheDocument();
      expect(screen.getByText('Operations Lead')).toBeInTheDocument();
    });

    // Check that the user's role is highlighted
    await waitFor(() => {
      expect(screen.getByText('Your Role')).toBeInTheDocument();
    });

    // Check that duties are displayed
    expect(screen.getByText('Overall incident command')).toBeInTheDocument();
    expect(screen.getByText('Strategic decisions')).toBeInTheDocument();
  });

  it('renders empty state when no responsibility cards', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser, error: null });
    mockReferenceApi.getResponsibilityCards.mockResolvedValue([]);

    render(<ResponsibilityCardList />);

    await waitFor(() => {
      expect(screen.getByText('No responsibility cards found')).toBeInTheDocument();
      expect(screen.getByText('Contact your administrator to set up roles')).toBeInTheDocument();
    });
  });

  it('renders error state when fetching fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser, error: null });
    mockReferenceApi.getResponsibilityCards.mockRejectedValue(new Error('Network error'));

    render(<ResponsibilityCardList />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  it('handles auth error gracefully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ 
      data: null, 
      error: { message: 'Auth error' } 
    });

    render(<ResponsibilityCardList />);

    await waitFor(() => {
      expect(screen.getByText('Auth error')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    mockSupabase.auth.getUser.mockReturnValue(new Promise(() => {}));
    mockReferenceApi.getResponsibilityCards.mockReturnValue(new Promise(() => {}));

    render(<ResponsibilityCardList className="custom-class" />);

    const container = screen.getByText('Responsibility Cards').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});