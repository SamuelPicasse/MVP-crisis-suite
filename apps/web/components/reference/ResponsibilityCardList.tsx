'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createReferenceApiClient } from '@crisis-suite/db';

interface ResponsibilityCardListProps {
  className?: string;
}

// Temporary interfaces to avoid conflicts
interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AppResponsibilityCard {
  id: string;
  role: string;
  duties: string[];
  description?: string;
  created_at: Date;
}

export function ResponsibilityCardList({ className = '' }: ResponsibilityCardListProps) {
  const [responsibilityCards, setResponsibilityCards] = useState<AppResponsibilityCard[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const referenceApi = createReferenceApiClient(supabase);

      // Get current user to highlight their role
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (userData?.user) {
        // For now, we'll use the user's metadata or assume role from profile
        // In a real app, you'd fetch this from your users table
        const userProfile = userData.user.user_metadata;
        setCurrentUser({
          id: userData.user.id,
          email: userData.user.email || '',
          fullName: userProfile?.full_name || 'Unknown User',
          role: userProfile?.role || 'Crisis Manager' // Default role for demo
        });
      }

      // Fetch responsibility cards
      const cards = await referenceApi.getResponsibilityCards();
      setResponsibilityCards(cards as unknown as AppResponsibilityCard[]);
    } catch (err) {
      console.error('Error fetching responsibility cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to load responsibility cards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Responsibility Cards</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="animate-pulse border rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Responsibility Cards</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (responsibilityCards.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Responsibility Cards</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No responsibility cards found</p>
          <p className="text-sm text-gray-400 mt-1">Contact your administrator to set up roles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Responsibility Cards</h2>
      
      <div className="space-y-4">
        {responsibilityCards.map((card) => {
          const isCurrentUserRole = currentUser?.role === card.role;
          
          return (
            <div 
              key={card.id} 
              className={`border rounded-lg p-4 transition-colors ${
                isCurrentUserRole 
                  ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-semibold ${
                  isCurrentUserRole ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {card.role}
                </h3>
                {isCurrentUserRole && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                    Your Role
                  </span>
                )}
              </div>
              
              {card.description && (
                <p className={`text-sm mb-4 ${
                  isCurrentUserRole ? 'text-blue-800' : 'text-gray-600'
                }`}>
                  {card.description}
                </p>
              )}
              
              <div>
                <h4 className={`text-sm font-medium mb-2 ${
                  isCurrentUserRole ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  Key Duties:
                </h4>
                <ul className="space-y-1">
                  {card.duties.map((duty: string, index: number) => (
                    <li 
                      key={index} 
                      className={`text-sm flex items-start ${
                        isCurrentUserRole ? 'text-blue-800' : 'text-gray-600'
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                        isCurrentUserRole ? 'bg-blue-400' : 'bg-gray-400'
                      }`}></span>
                      {duty}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}