'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createReferenceApiClient, type CrisisDocument } from '@crisis-suite/db';

interface DocumentListProps {
  className?: string;
}

export function DocumentList({ className = '' }: DocumentListProps) {
  const [documents, setDocuments] = useState<CrisisDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const referenceApi = createReferenceApiClient(supabase);

      const docs = await referenceApi.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CrisisPlan':
        return 'text-red-700 bg-red-50 ring-red-600/20';
      case 'Procedure':
        return 'text-blue-700 bg-blue-50 ring-blue-600/20';
      case 'Reference':
        return 'text-green-700 bg-green-50 ring-green-600/20';
      default:
        return 'text-gray-700 bg-gray-50 ring-gray-600/20';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CrisisPlan':
        return 'Crisis Plan';
      case 'Procedure':
        return 'Procedure';
      case 'Reference':
        return 'Reference';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Documents</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="animate-pulse border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Documents</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={fetchDocuments}
            className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Documents</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No documents found</p>
          <p className="text-sm text-gray-400 mt-1">Contact your administrator to add documents</p>
        </div>
      </div>
    );
  }

  // Group documents by type
  const documentsByType = documents.reduce((acc, doc: CrisisDocument) => {
    const { type = 'Reference' } = doc;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, CrisisDocument[]>);

  const typeOrder = ['CrisisPlan', 'Procedure', 'Reference'];
  const sortedTypes = typeOrder.filter(type => documentsByType[type]);

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Documents</h2>
      
      <div className="space-y-8">
        {sortedTypes.map((type) => (
          <div key={type}>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset mr-3 ${getTypeColor(type)}`}>
                {getTypeLabel(type)}
              </span>
              ({documentsByType[type].length} {documentsByType[type].length === 1 ? 'document' : 'documents'})
            </h3>
            
            <div className="space-y-3">
              {documentsByType[type].map((doc) => {
                return (
                  <div 
                    key={doc.id} 
                    className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-gray-900 mb-2">
                          {doc.title}
                        </h4>
                        
                        {doc.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {doc.description}
                          </p>
                        )}
                        
                        {doc.content && (
                          <div className="bg-gray-50 rounded-md p-3 mb-3">
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {doc.content}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>
                            Created: {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                          {doc.updated_at !== doc.created_at && (
                            <span>
                              Updated: {new Date(doc.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {doc.file_url && (
                        <div className="ml-4">
                          <a 
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}