import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DocumentsPage from './page';

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
    signOut: mockSignOut
  }
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}));

// Mock the DocumentList component
vi.mock('../../../components/reference/DocumentList', () => ({
  DocumentList: () => <div data-testid="document-list">DocumentList Component</div>
}));

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page with correct title and navigation', () => {
    render(<DocumentsPage />);

    expect(screen.getByText('Crisis Management Suite')).toBeInTheDocument();
    expect(screen.getByText('Crisis Documents')).toBeInTheDocument();
    expect(screen.getByText('Access crisis management plans, procedures, and reference documents.')).toBeInTheDocument();
  });

  it('renders navigation with correct active state', () => {
    render(<DocumentsPage />);

    // Check navigation links
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const responsibilityCardsLink = screen.getByText('Responsibility Cards').closest('a');
    const documentsLink = screen.getByText('Documents').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(responsibilityCardsLink).toHaveAttribute('href', '/responsibility-cards');
    expect(documentsLink).toHaveClass('text-blue-600');
  });

  it('renders DocumentList component', () => {
    render(<DocumentsPage />);

    expect(screen.getByTestId('document-list')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    mockSignOut.mockResolvedValue({});

    const { rerender } = render(<DocumentsPage />);

    const logoutButton = screen.getByText('Logout');
    
    // Simulate the click event
    await logoutButton.click();
    
    // Allow time for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    rerender(<DocumentsPage />);

    expect(mockSignOut).toHaveBeenCalled();
  });
});