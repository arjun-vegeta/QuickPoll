'use client';

import { useState, useEffect } from 'react';
import { Poll } from '@/types/poll';
import { pollsApi } from '@/lib/api';

export function usePoll(pollId: string) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        const data = await pollsApi.getById(pollId);
        setPoll(data);
        setError(null);
      } catch (err) {
        setError('Failed to load poll');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (pollId) {
      fetchPoll();
    }
  }, [pollId]);

  return { poll, loading, error };
}
