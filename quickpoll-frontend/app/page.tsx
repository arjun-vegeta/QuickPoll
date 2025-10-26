'use client';

import { useEffect, useState } from 'react';
import { PollCard } from '@/components/PollCard';
import { Poll } from '@/types/poll';
import { pollsApi } from '@/lib/api';
import { isAuthenticated, getUser } from '@/lib/auth';

export default function Home() {
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const user = isAuthenticated() ? getUser() : null;

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await pollsApi.getAll();
        setAllPolls(data);
        
        // Filter user's polls if logged in
        if (user) {
          const userPolls = data.filter(poll => poll.creator_id === user.id);
          setMyPolls(userPolls);
        }
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading polls...</p>
        </div>
      </div>
    );
  }

  const displayPolls = activeTab === 'my' ? myPolls : allPolls;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {activeTab === 'my' ? 'My Polls' : 'Active Polls'}
        </h1>
        <p className="text-muted-foreground">
          {activeTab === 'my' 
            ? 'Polls you have created' 
            : 'Vote on polls and see results update in real-time'}
        </p>
      </div>

      {user && (
        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Polls ({allPolls.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'my'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Polls ({myPolls.length})
          </button>
        </div>
      )}

      {displayPolls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">
            {activeTab === 'my' ? 'You haven\'t created any polls yet' : 'No polls yet'}
          </p>
          <a 
            href="/create" 
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Create {activeTab === 'my' ? 'your first' : 'the first'} poll
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
