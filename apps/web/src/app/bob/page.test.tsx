import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BobPage from './page';

// Mock Next.js router
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn(),
    },
  }),
}));

describe('BobPage', () => {
  it('should render BOB model page with three columns', () => {
    render(<BobPage />);
    
    // Check header and navigation
    expect(screen.getByText('Crisis Management Suite')).toBeInTheDocument();
    expect(screen.getByText('BOB Model')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Responsibility Cards')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    
    // Check BOB model columns
    expect(screen.getByText('Situation Assessment')).toBeInTheDocument();
    expect(screen.getByText('Judgments')).toBeInTheDocument();
    expect(screen.getByText('Decisions')).toBeInTheDocument();
    
    // Check placeholder text
    expect(screen.getByText('Add your situation assessments here')).toBeInTheDocument();
    expect(screen.getByText('Add your judgments here')).toBeInTheDocument();
    expect(screen.getByText('Add your decisions here')).toBeInTheDocument();
  });

  it('should have active BOB Model navigation link', () => {
    render(<BobPage />);
    
    const bobLink = screen.getByText('BOB Model');
    expect(bobLink).toHaveClass('text-blue-600', 'font-medium', 'border-blue-600');
  });

  it('should have responsive grid layout classes', () => {
    render(<BobPage />);
    
    const gridContainer = screen.getByText('Situation Assessment').closest('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-3');
  });

  it('should have Add Entry buttons in each column', () => {
    render(<BobPage />);
    
    const addButtons = screen.getAllByText('Add Entry');
    expect(addButtons).toHaveLength(3);
  });

  it('should open modal when Add Entry button is clicked', async () => {
    render(<BobPage />);
    
    const addButton = screen.getAllByText('Add Entry')[0]; // First column (Assessment)
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Add Situation Assessment')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your text here...')).toBeInTheDocument();
    });
  });

  it('should validate minimum text length', async () => {
    render(<BobPage />);
    
    // Open modal
    const addButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(addButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'ab' } }); // Less than 3 characters
      
      expect(screen.getByText('Minimum 3 characters required')).toBeInTheDocument();
      
      // Check that there is a disabled submit button in the modal
      const buttons = screen.getAllByText('Add Entry');
      const modalSubmitButton = buttons.find(button => 
        button.closest('[class*="fixed"]') !== null
      );
      expect(modalSubmitButton).toBeDisabled();
    });
  });

  it('should validate maximum text length', async () => {
    render(<BobPage />);
    
    // Open modal
    const addButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(addButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'a'.repeat(501) } }); // More than 500 characters
      
      expect(screen.getByText('Maximum 500 characters exceeded')).toBeInTheDocument();
      
      // Check that there is a disabled submit button in the modal
      const buttons = screen.getAllByText('Add Entry');
      const modalSubmitButton = buttons.find(button => 
        button.closest('[class*="fixed"]') !== null
      );
      expect(modalSubmitButton).toBeDisabled();
    });
  });

  it('should show character count', async () => {
    render(<BobPage />);
    
    // Open modal
    const addButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(addButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Test content' } });
      
      expect(screen.getByText('12/500 characters')).toBeInTheDocument();
    });
  });

  it('should create and display entry when valid input is submitted', async () => {
    render(<BobPage />);
    
    // Open modal
    const addButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(addButton);
    
    await waitFor(async () => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Fire reported in building A' } });
      
      // Find the modal submit button specifically
      const buttons = screen.getAllByText('Add Entry');
      const modalSubmitButton = buttons.find(button => 
        button.closest('[class*="fixed"]') !== null
      ) as HTMLElement;
      fireEvent.click(modalSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Fire reported in building A')).toBeInTheDocument();
      });
    });
  });

  it('should close modal when Cancel button is clicked', async () => {
    render(<BobPage />);
    
    // Open modal
    const addButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(addButton);
    
    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText('Add Situation Assessment')).not.toBeInTheDocument();
    });
  });

  it('should show correct modal title for each column type', async () => {
    render(<BobPage />);
    
    // Test Assessment column
    const assessmentButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(assessmentButton);
    await waitFor(() => {
      expect(screen.getByText('Add Situation Assessment')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    // Test Judgment column
    const judgmentButton = screen.getAllByText('Add Entry')[1];
    fireEvent.click(judgmentButton);
    await waitFor(() => {
      expect(screen.getByText('Add Judgment')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    // Test Decision column
    const decisionButton = screen.getAllByText('Add Entry')[2];
    fireEvent.click(decisionButton);
    await waitFor(() => {
      expect(screen.getByText('Add Decision')).toBeInTheDocument();
    });
  });

  it('should show Link button only on Judgment and Decision entries', async () => {
    render(<BobPage />);
    
    // Add an assessment entry (should not have link button)
    const assessmentAddButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(assessmentAddButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Fire reported' } });
      
      const submitButton = screen.getAllByText('Add Entry').find(button => 
        button.closest('[class*="fixed"]') !== null
      ) as HTMLElement;
      fireEvent.click(submitButton);
    });

    // Add a judgment entry (should have link button)
    const judgmentAddButton = screen.getAllByText('Add Entry')[1];
    fireEvent.click(judgmentAddButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Building unsafe' } });
      
      const submitButton = screen.getAllByText('Add Entry').find(button => 
        button.closest('[class*="fixed"]') !== null
      ) as HTMLElement;
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // Assessments should not have link buttons
      const assessmentContainer = screen.getByText('Fire reported').closest('div');
      expect(assessmentContainer?.querySelector('button')).toBeFalsy();
      
      // Judgments should have link buttons
      const judgmentContainer = screen.getByText('Building unsafe').closest('div');
      expect(judgmentContainer?.querySelector('button')).toBeTruthy();
      expect(screen.getByText('Link')).toBeInTheDocument();
    });
  });

  it('should open link modal when Link button is clicked', async () => {
    render(<BobPage />);
    
    // First create an assessment entry to link to
    const assessmentAddButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(assessmentAddButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Fire reported' } });
      
      const submitButton = screen.getAllByText('Add Entry').find(button => 
        button.closest('[class*="fixed"]') !== null
      ) as HTMLElement;
      fireEvent.click(submitButton);
    });

    // Then create a judgment entry
    const judgmentAddButton = screen.getAllByText('Add Entry')[1];
    fireEvent.click(judgmentAddButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Building unsafe' } });
      
      const submitButton = screen.getAllByText('Add Entry').find(button => 
        button.closest('[class*="fixed"]') !== null
      ) as HTMLElement;
      fireEvent.click(submitButton);
    });

    // Click the Link button
    await waitFor(() => {
      const linkButton = screen.getByText('Link');
      fireEvent.click(linkButton);
      
      expect(screen.getByText('Link Entry')).toBeInTheDocument();
      expect(screen.getByText('Select entries to link to:')).toBeInTheDocument();
    });
  });

  it('should allow selecting and linking entries', async () => {
    render(<BobPage />);
    
    // Create assessment
    const assessmentAddButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(assessmentAddButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Fire reported' } });
      
      const submitButton = screen.getAllByText('Add Entry').find(button => 
        button.closest('[class*="fixed"]') !== null
      ) as HTMLElement;
      fireEvent.click(submitButton);
    });

    // Create judgment
    const judgmentAddButton = screen.getAllByText('Add Entry')[1];
    fireEvent.click(judgmentAddButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Building unsafe' } });
      
      const submitButton = screen.getAllByText('Add Entry').find(button => 
        button.closest('[class*="fixed"]') !== null
      ) as HTMLElement;
      fireEvent.click(submitButton);
    });

    // Open link modal and create link
    await waitFor(() => {
      const linkButton = screen.getByText('Link');
      fireEvent.click(linkButton);
      
      // Select the assessment to link to
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      // Submit the link
      const createLinkButton = screen.getByText(/Create Links/);
      fireEvent.click(createLinkButton);
    });

    // Verify the link was created
    await waitFor(() => {
      expect(screen.getByText('Links to:')).toBeInTheDocument();
      expect(screen.getByText('Fire reported...')).toBeInTheDocument();
    });
  });

  it('should show visual indicators for linked entries', async () => {
    render(<BobPage />);
    
    // Create assessment
    const assessmentAddButton = screen.getAllByText('Add Entry')[0];
    fireEvent.click(assessmentAddButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Fire reported' } });
      
      const submitButton = screen.getAllByText('Add Entry').find(button => 
        button.closest('[class*="fixed"]') !== null
      ) as HTMLElement;
      fireEvent.click(submitButton);
    });

    // Create judgment
    const judgmentAddButton = screen.getAllByText('Add Entry')[1];
    fireEvent.click(judgmentAddButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter your text here...');
      fireEvent.change(textarea, { target: { value: 'Building unsafe' } });
      
      const submitButton = screen.getAllByText('Add Entry').find(button => 
        button.closest('[class*="fixed"]') !== null
      ) as HTMLElement;
      fireEvent.click(submitButton);
    });

    // Create link
    await waitFor(() => {
      const linkButton = screen.getByText('Link');
      fireEvent.click(linkButton);
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      const createLinkButton = screen.getByText(/Create Links/);
      fireEvent.click(createLinkButton);
    });

    // Check for visual indicators
    await waitFor(() => {
      // Should show visual indicators for linking
      expect(screen.getByText('Linked')).toBeInTheDocument();
      expect(screen.getByText('Links to:')).toBeInTheDocument();
    });
  });
});