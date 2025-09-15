import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ResponsibilityCardsPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  })
}));

// Mock the Supabase client
const mockSignOut = vi.fn();
const mockSupabase = {
  auth: {
    signOut: mockSignOut,
    getUser: vi.fn()
  },
  rpc: vi.fn()
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}));

// Mock the ResponsibilityCardList component
vi.mock('../../../components/reference/ResponsibilityCardList', () => ({
  ResponsibilityCardList: () => <div data-testid="responsibility-card-list">ResponsibilityCardList Component</div>
}));

describe('ResponsibilityCardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page with correct title and navigation', () => {
    render(<ResponsibilityCardsPage />);

    expect(screen.getByText('Crisis Management Suite')).toBeInTheDocument();
    expect(screen.getAllByText('Responsibility Cards')).toHaveLength(2); // One in nav, one as page title
    expect(screen.getByText('Review the roles and responsibilities for each Crisis Management Team position.')).toBeInTheDocument();
  });

  it('renders navigation with correct active state', () => {
    render(<ResponsibilityCardsPage />);

    // Check navigation links
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const responsibilityCardsLinks = screen.getAllByText('Responsibility Cards');
    const navResponsibilityCardsLink = responsibilityCardsLinks.find(link => link.closest('nav'))?.closest('a');
    const documentsLink = screen.getByText('Documents').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(navResponsibilityCardsLink).toHaveClass('text-blue-600');
    expect(documentsLink).toHaveAttribute('href', '/documents');
  });

  it('renders ResponsibilityCardList component', () => {
    render(<ResponsibilityCardsPage />);

    expect(screen.getByTestId('responsibility-card-list')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    mockSignOut.mockResolvedValue({});

    const { rerender } = render(<ResponsibilityCardsPage />);

    const logoutButton = screen.getByText('Logout');
    
    // Simulate the click event
    await logoutButton.click();
    
    // Allow time for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    rerender(<ResponsibilityCardsPage />);

    expect(mockSignOut).toHaveBeenCalled();
  });
});