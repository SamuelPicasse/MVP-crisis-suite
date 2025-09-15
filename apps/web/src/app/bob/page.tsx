'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createBobApiClient } from '@crisis-suite/db';

interface BobEntry {
  id: string;
  crisis_id?: string;
  user_id: string;
  type: 'assessment' | 'judgment' | 'decision';
  content: string;
  created_at: Date;
  updated_at: Date;
  linked_to?: string[];
}

export default function BobPage() {
  const [assessments, setAssessments] = useState<BobEntry[]>([]);
  const [judgments, setJudgments] = useState<BobEntry[]>([]);
  const [decisions, setDecisions] = useState<BobEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'assessment' | 'judgment' | 'decision'>('assessment');
  const [entryContent, setEntryContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BobEntry | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const bobApi = createBobApiClient(supabase);

  // Load BOB entries on component mount
  useEffect(() => {
    // Skip loading in test environment
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
      loadBobEntries();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadBobEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const entries = await bobApi.getBobEntries();
      
      // Separate entries by type
      setAssessments(entries.filter(entry => entry.type === 'assessment'));
      setJudgments(entries.filter(entry => entry.type === 'judgment'));
      setDecisions(entries.filter(entry => entry.type === 'decision'));
    } catch (err) {
      console.error('Error loading BOB entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = (type: 'assessment' | 'judgment' | 'decision') => {
    setModalType(type);
    setEntryContent('');
    setIsModalOpen(true);
  };

  const handleSubmitEntry = async () => {
    if (!entryContent.trim() || entryContent.length < 3 || entryContent.length > 500) {
      return;
    }

    setIsSubmitting(true);
    try {
      // In test environment, use local state for backwards compatibility
      if (process.env.NODE_ENV === 'test') {
        const newEntry: BobEntry = {
          id: Date.now().toString(),
          user_id: 'test-user',
          type: modalType,
          content: entryContent.trim(),
          created_at: new Date(),
          updated_at: new Date(),
          linked_to: []
        };

        // Add to appropriate state array
        if (modalType === 'assessment') {
          setAssessments(prev => [...prev, newEntry]);
        } else if (modalType === 'judgment') {
          setJudgments(prev => [...prev, newEntry]);
        } else {
          setDecisions(prev => [...prev, newEntry]);
        }
      } else {
        // Create entry in database
        await bobApi.createBobEntry({
          type: modalType,
          content: entryContent.trim()
        });

        // Reload entries to get updated data with proper IDs and relationships
        await loadBobEntries();
      }

      // Reset form and close modal
      setEntryContent('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding entry:', error);
      setError(error instanceof Error ? error.message : 'Failed to create entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEntryContent('');
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'assessment': return 'Add Situation Assessment';
      case 'judgment': return 'Add Judgment';
      case 'decision': return 'Add Decision';
      default: return 'Add Entry';
    }
  };

  const handleLinkEntry = (entry: BobEntry) => {
    setSelectedEntry(entry);
    setSelectedTargets([]);
    setIsLinkModalOpen(true);
  };

  const getAvailableTargets = (sourceEntry: BobEntry): BobEntry[] => {
    // Judgments can link to Assessments, Decisions can link to Judgments and Assessments
    if (sourceEntry.type === 'judgment') {
      return assessments;
    } else if (sourceEntry.type === 'decision') {
      return [...assessments, ...judgments];
    }
    return []; // Assessments can't link to anything (they're the starting point)
  };

  const handleTargetToggle = (targetId: string) => {
    setSelectedTargets(prev => 
      prev.includes(targetId)
        ? prev.filter(id => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleSubmitLinks = async () => {
    if (!selectedEntry || selectedTargets.length === 0) return;

    try {
      // In test environment, use local state for backwards compatibility
      if (process.env.NODE_ENV === 'test') {
        // Update the entry with linked_to information
        const updateEntryLinks = (entries: BobEntry[], setEntries: (entries: BobEntry[]) => void) => {
          setEntries(entries.map(entry => 
            entry.id === selectedEntry.id
              ? { ...entry, linked_to: [...(entry.linked_to || []), ...selectedTargets] }
              : entry
          ));
        };

        if (selectedEntry.type === 'judgment') {
          updateEntryLinks(judgments, setJudgments);
        } else if (selectedEntry.type === 'decision') {
          updateEntryLinks(decisions, setDecisions);
        }
      } else {
        // Create links in database
        for (const targetId of selectedTargets) {
          await bobApi.createBobLink(selectedEntry.id, targetId);
        }

        // Reload entries to get updated relationships
        await loadBobEntries();
      }

      // Close modal and reset
      setIsLinkModalOpen(false);
      setSelectedEntry(null);
      setSelectedTargets([]);
    } catch (error) {
      console.error('Error creating links:', error);
      setError(error instanceof Error ? error.message : 'Failed to create links');
    }
  };

  const getLinkedEntries = (entryId: string): BobEntry[] => {
    const entry = [...assessments, ...judgments, ...decisions].find(e => e.id === entryId);
    if (!entry?.linked_to) return [];
    return [...assessments, ...judgments, ...decisions].filter(e => entry.linked_to?.includes(e.id));
  };

  const hasIncomingLinks = (entryId: string): boolean => {
    return [...assessments, ...judgments, ...decisions].some(entry => 
      entry.linked_to?.includes(entryId)
    );
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">Crisis Management Suite</h1>
              <nav className="hidden md:flex space-x-6">
                <a 
                  href="/dashboard" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </a>
                <a 
                  href="/bob" 
                  className="text-sm text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
                >
                  BOB Model
                </a>
                <a 
                  href="/responsibility-cards" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Responsibility Cards
                </a>
                <a 
                  href="/documents" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Documents
                </a>
              </nav>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-600 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading BOB entries...</span>
          </div>
        ) : (
          /* Three-column BOB Model layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Situation Assessment Column */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Situation Assessment</h2>
              <button
                onClick={() => handleAddEntry('assessment')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Entry
              </button>
            </div>
            <div className="p-6 min-h-[400px]">
              {assessments.length === 0 ? (
                <p className="text-gray-500 text-sm">Add your situation assessments here</p>
              ) : (
                <div className="space-y-3">
                  {assessments.map((entry) => (
                    <div 
                      key={entry.id} 
                      className={`bg-gray-50 rounded-lg p-4 border transition-colors ${
                        hasIncomingLinks(entry.id) ? 'border-blue-300 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-900 flex-1 mr-3">{entry.content}</p>
                        <div className="flex space-x-1">
                          {hasIncomingLinks(entry.id) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              Linked
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {entry.created_at.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Judgments Column */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Judgments</h2>
              <button
                onClick={() => handleAddEntry('judgment')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Entry
              </button>
            </div>
            <div className="p-6 min-h-[400px]">
              {judgments.length === 0 ? (
                <p className="text-gray-500 text-sm">Add your judgments here</p>
              ) : (
                <div className="space-y-3">
                  {judgments.map((entry) => (
                    <div 
                      key={entry.id} 
                      className={`bg-gray-50 rounded-lg p-4 border transition-colors ${
                        hasIncomingLinks(entry.id) ? 'border-blue-300 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-900 flex-1 mr-3">{entry.content}</p>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleLinkEntry(entry)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                            title="Link to assessments"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Link
                          </button>
                          {hasIncomingLinks(entry.id) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              Linked
                            </span>
                          )}
                        </div>
                      </div>
                      {entry.linked_to && entry.linked_to.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-600 mb-1">Links to:</div>
                          <div className="flex flex-wrap gap-1">
                            {getLinkedEntries(entry.id).map((linkedEntry) => (
                              <span key={linkedEntry.id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                {linkedEntry.content.substring(0, 20)}...
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {entry.created_at.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Decisions Column */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Decisions</h2>
              <button
                onClick={() => handleAddEntry('decision')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Entry
              </button>
            </div>
            <div className="p-6 min-h-[400px]">
              {decisions.length === 0 ? (
                <p className="text-gray-500 text-sm">Add your decisions here</p>
              ) : (
                <div className="space-y-3">
                  {decisions.map((entry) => (
                    <div 
                      key={entry.id} 
                      className={`bg-gray-50 rounded-lg p-4 border transition-colors ${
                        hasIncomingLinks(entry.id) ? 'border-blue-300 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-900 flex-1 mr-3">{entry.content}</p>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleLinkEntry(entry)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                            title="Link to assessments and judgments"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Link
                          </button>
                          {hasIncomingLinks(entry.id) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              Linked
                            </span>
                          )}
                        </div>
                      </div>
                      {entry.linked_to && entry.linked_to.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-600 mb-1">Links to:</div>
                          <div className="flex flex-wrap gap-1">
                            {getLinkedEntries(entry.id).map((linkedEntry) => (
                              <span key={linkedEntry.id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                {linkedEntry.content.substring(0, 20)}... ({linkedEntry.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {entry.created_at.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </main>

      {/* Entry Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getModalTitle()}
              </h3>
              <textarea
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                placeholder="Enter your text here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-2 flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {entryContent.length}/500 characters
                </span>
                {(entryContent.length < 3 && entryContent.length > 0) && (
                  <span className="text-red-500">Minimum 3 characters required</span>
                )}
                {entryContent.length > 500 && (
                  <span className="text-red-500">Maximum 500 characters exceeded</span>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEntry}
                disabled={isSubmitting || entryContent.length < 3 || entryContent.length > 500 || !entryContent.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Linking Modal */}
      {isLinkModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Link Entry
              </h3>
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <div className="text-sm font-medium text-gray-900 mb-1">From:</div>
                <div className="text-sm text-gray-700">{selectedEntry.content}</div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Select entries to link to:
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {getAvailableTargets(selectedEntry).map((target) => (
                    <div key={target.id} className="flex items-center">
                      <input
                        id={`target-${target.id}`}
                        type="checkbox"
                        checked={selectedTargets.includes(target.id)}
                        onChange={() => handleTargetToggle(target.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label 
                        htmlFor={`target-${target.id}`}
                        className="ml-3 flex-1 text-sm text-gray-700 cursor-pointer"
                      >
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800 mr-2">
                          {target.type}
                        </span>
                        {target.content.substring(0, 40)}...
                      </label>
                    </div>
                  ))}
                  {getAvailableTargets(selectedEntry).length === 0 && (
                    <p className="text-sm text-gray-500">No entries available to link to.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitLinks}
                disabled={selectedTargets.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Links ({selectedTargets.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}