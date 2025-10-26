'use client';

import { useState, useEffect } from 'react';
import { CreatePollForm } from '@/components/CreatePollForm';
import { AuthModal } from '@/components/AuthModal';
import { isAuthenticated } from '@/lib/auth';

export default function CreatePage() {
  const [showAuth, setShowAuth] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsAuth(authenticated);
    if (!authenticated) {
      setShowAuth(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setIsAuth(true);
    window.location.reload();
  };

  if (!isAuth && !showAuth) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {showAuth && (
        <AuthModal
          onClose={() => window.location.href = '/'}
          onSuccess={handleAuthSuccess}
        />
      )}
      {isAuth && <CreatePollForm />}
    </div>
  );
}
