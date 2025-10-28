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
      <div className="flex items-center justify-center min-h-[400px] bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34CC41] mx-auto"></div>
          <p className="mt-4 text-[#A4A4A4]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthModal
        open={showAuth}
        onClose={() => window.location.href = '/'}
        onSuccess={handleAuthSuccess}
      />
      {isAuth && <CreatePollForm />}
    </>
  );
}
