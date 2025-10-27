'use client';

import { useState, useEffect } from 'react';
import { getUser, logout, isAuthenticated } from '@/lib/auth';
import { LogOut, User as UserIcon } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { ThemeToggle } from '@/components/ThemeToggle';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setUser(getUser());
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#1e1e1e] dark:via-[#1a1a1a] dark:to-[#1e1e1e]">
      {/* Modern Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-[#1e1e1e]/80 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-sm">Q</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                QuickPoll
              </span>
            </a>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <a 
                    href="/create" 
                    className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white dark:text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium text-sm"
                  >
                    Create Poll
                  </a>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm"
                  >
                    Login
                  </button>
                  <a 
                    href="/create" 
                    className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white dark:text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium text-sm"
                  >
                    Create Poll
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    
      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {children}
      </main>
      
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
