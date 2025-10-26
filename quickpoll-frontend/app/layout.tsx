'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from 'react';
import { getUser, logout, isAuthenticated } from '@/lib/auth';
import { LogOut, User as UserIcon } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <nav className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <a href="/" className="text-2xl font-bold text-primary">
                  QuickPoll
                </a>
                <div className="flex items-center gap-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserIcon className="h-4 w-4" />
                        <span>{user.username}</span>
                      </div>
                      <a 
                        href="/create" 
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Create Poll
                      </a>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
                      >
                        Login
                      </button>
                      <a 
                        href="/create" 
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Create Poll
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          
          {showAuthModal && (
            <AuthModal
              onClose={() => setShowAuthModal(false)}
              onSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </body>
    </html>
  );
}
