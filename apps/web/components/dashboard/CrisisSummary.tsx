'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CrisisWithDuration } from '@crisis-suite/db';

interface CrisisSummaryProps {
  className?: string;
}

export function CrisisSummary({ className = '' }: CrisisSummaryProps) {
  const [crisis, setCrisis] = useState<CrisisWithDuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentCrisis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data, error: rpcError } = await supabase
        .rpc('get_current_crisis');

      if (rpcError) {
        throw rpcError;
      }

      const crisisData = data as { id: string; name: string; status: string; start_time: string; duration: string } | null;
      if (crisisData && (Array.isArray(crisisData) ? crisisData.length > 0 : crisisData)) {
        const crisis = Array.isArray(crisisData) ? crisisData[0] : crisisData;
        setCrisis({
          id: crisis.id,
          name: crisis.name,
          status: crisis.status,
          start_time: crisis.start_time,
          duration: formatDuration(crisis.duration)
        });
      } else {
        setCrisis(null);
      }
    } catch (err) {
      console.error('Error fetching crisis:', err);
      setError('Failed to load crisis information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentCrisis();
  }, [fetchCurrentCrisis]);

  const formatDuration = (duration: string): string => {
    if (!duration) return '0 minutes';
    
    // Parse PostgreSQL interval format
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (!match) return duration;
    
    const [, hours, minutes] = match;
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    
    if (h > 0) {
      return `${h}h ${m}m`;
    } else {
      return `${m}m`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-red-600 bg-red-50';
      case 'Monitoring':
        return 'text-yellow-600 bg-yellow-50';
      case 'Closed':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Crisis Summary</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Crisis Summary</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={fetchCurrentCrisis}
            className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!crisis) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Crisis Summary</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No active crisis</p>
          <p className="text-sm text-gray-400 mt-1">System is operating normally</p>
        </div>
      </div>
    );
  }

  const startTime = new Date(crisis.start_time);

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Crisis Summary</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Crisis Name</label>
          <p className="text-base text-gray-900 font-medium">{crisis.name}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <div className="mt-1">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(crisis.status)}`}>
              {crisis.status}
            </span>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Start Time</label>
          <p className="text-base text-gray-900">
            {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString()}
          </p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Duration</label>
          <p className="text-base text-gray-900 font-medium">{crisis.duration}</p>
        </div>
      </div>
    </div>
  );
}