'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ResponsibilityCardList } from '../../../components/reference/ResponsibilityCardList';

export default function ResponsibilityCardsPage() {
  const router = useRouter();

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
                  href="/responsibility-cards" 
                  className="text-sm text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Responsibility Cards</h1>
          <p className="text-gray-600 mt-2">
            Review the roles and responsibilities for each Crisis Management Team position.
          </p>
        </div>
        
        <ResponsibilityCardList />
      </main>
    </div>
  );
}