import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DocumentList } from './DocumentList';

// Mock the Supabase client
const mockSupabase = {
  rpc: vi.fn()
};

const mockReferenceApi = {
  getDocuments: vi.fn()
};

// Mock the modules
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}));

vi.mock('@crisis-suite/db', () => ({
  createReferenceApiClient: () => mockReferenceApi
}));

const mockDocuments = [
  {
    id: '1',
    title: 'Crisis Response Plan',
    description: 'Comprehensive crisis response plan',
    type: 'CrisisPlan' as const,
    content: 'This document contains the master crisis response plan...',
    file_url: null,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: '2',
    title: 'Evacuation Procedures',
    description: 'Step-by-step evacuation procedures',
    type: 'Procedure' as const,
    content: 'Detailed evacuation procedures...',
    file_url: 'https://example.com/evacuation.pdf',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-02T00:00:00Z')
  },
  {
    id: '3',
    title: 'Emergency Contact Directory',
    description: 'Directory of key contacts',
    type: 'Reference' as const,
    content: 'Complete contact directory...',
    file_url: null,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  }
];

describe('DocumentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockReferenceApi.getDocuments.mockReturnValue(new Promise(() => {}));

    render(<DocumentList />);

    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders documents grouped by type', async () => {
    mockReferenceApi.getDocuments.mockResolvedValue(mockDocuments);

    render(<DocumentList />);

    await waitFor(() => {
      expect(screen.getByText('Crisis Response Plan')).toBeInTheDocument();
      expect(screen.getByText('Evacuation Procedures')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contact Directory')).toBeInTheDocument();
    });

    // Check type grouping headers
    expect(screen.getByText('Crisis Plan')).toBeInTheDocument();
    expect(screen.getByText('Procedure')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();

    // Check document counts
    expect(screen.getByText('(1 document)')).toBeInTheDocument();
  });

  it('renders download links for documents with file URLs', async () => {
    mockReferenceApi.getDocuments.mockResolvedValue(mockDocuments);

    render(<DocumentList />);

    await waitFor(() => {
      const downloadLinks = screen.getAllByText('Download');
      expect(downloadLinks).toHaveLength(1); // Only one document has file_url
      
      const downloadLink = downloadLinks[0].closest('a');
      expect(downloadLink).toHaveAttribute('href', 'https://example.com/evacuation.pdf');
      expect(downloadLink).toHaveAttribute('target', '_blank');
    });
  });

  it('shows created and updated dates', async () => {
    mockReferenceApi.getDocuments.mockResolvedValue(mockDocuments);

    render(<DocumentList />);

    await waitFor(() => {
      expect(screen.getByText('Created: 1/1/2024')).toBeInTheDocument();
      expect(screen.getByText('Updated: 1/2/2024')).toBeInTheDocument();
    });
  });

  it('renders empty state when no documents', async () => {
    mockReferenceApi.getDocuments.mockResolvedValue([]);

    render(<DocumentList />);

    await waitFor(() => {
      expect(screen.getByText('No documents found')).toBeInTheDocument();
      expect(screen.getByText('Contact your administrator to add documents')).toBeInTheDocument();
    });
  });

  it('renders error state when fetching fails', async () => {
    mockReferenceApi.getDocuments.mockRejectedValue(new Error('Network error'));

    render(<DocumentList />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  it('displays document content in preview', async () => {
    mockReferenceApi.getDocuments.mockResolvedValue([mockDocuments[0]]);

    render(<DocumentList />);

    await waitFor(() => {
      expect(screen.getByText('This document contains the master crisis response plan...')).toBeInTheDocument();
    });
  });

  it('applies correct type colors', async () => {
    mockReferenceApi.getDocuments.mockResolvedValue([mockDocuments[0]]);

    render(<DocumentList />);

    await waitFor(() => {
      const crisisPlanBadge = screen.getByText('Crisis Plan');
      expect(crisisPlanBadge).toHaveClass('text-red-700', 'bg-red-50');
    });
  });

  it('applies custom className', () => {
    mockReferenceApi.getDocuments.mockReturnValue(new Promise(() => {}));

    render(<DocumentList className="custom-class" />);

    const container = screen.getByText('Documents').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});