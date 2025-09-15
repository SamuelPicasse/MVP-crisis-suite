'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CrisisSummary } from '../../../components/dashboard/CrisisSummary';
import { ActivityLog } from '../../../components/dashboard/ActivityLog';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  // Ensure the user's profile row exists after magic-link redirect or first login
  useEffect(() => {
    const ensureProfile = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (user) {
          await supabase
            .from('users')
            .upsert(
              {
                id: user.id,
                email: user.email ?? '',
                full_name: (user.user_metadata as any)?.full_name ?? null,
                role: (user.user_metadata as any)?.role ?? null
              },
              { onConflict: 'id' }
            );
        }
      } catch {
        // ignore silently
      }
    };
    ensureProfile();
  }, []);

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
                  className="text-sm text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
                >
                  Dashboard
                </a>
                <a 
                  href="/bob" 
                  className="text-sm text-gray-600 hover:text-gray-900"
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
        {/* Two-column dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Wider) - Crisis Summary and Activity Log */}
          <div className="lg:col-span-2 space-y-8">
            <CrisisSummary />
            <ActivityLog />
          </div>
          
          {/* Right Column (Narrower) - Future widgets */}
          <div className="space-y-8">
            {/* Placeholder for future widgets like "Incident Location" and "My Tasks" */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Location</h2>
              <p className="text-gray-500 text-sm">Location widget will be implemented in future stories</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h2>
              <p className="text-gray-500 text-sm">Task widget will be implemented in future stories</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
