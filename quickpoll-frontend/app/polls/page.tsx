'use client';

import { useEffect, useState } from 'react';
import { PollCard } from '@/components/PollCard';
import { Poll } from '@/types/poll';
import { pollsApi } from '@/lib/api';
import { isAuthenticated, getUser } from '@/lib/auth';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare } from 'lucide-react';

export default function PollsPage() {
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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent dark:from-white dark:via-gray-200 dark:to-white">
          {activeTab === 'my' ? 'My Polls' : 'Discover Polls'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {activeTab === 'my' 
            ? 'Manage and track your created polls' 
            : 'Vote on polls and watch results update in real-time'}
        </p>
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex justify-center">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'my')} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="all" className="text-sm font-medium">
                All Polls <span className="ml-2 text-xs opacity-60">({allPolls.length})</span>
              </TabsTrigger>
              <TabsTrigger value="my" className="text-sm font-medium">
                My Polls <span className="ml-2 text-xs opacity-60">({myPolls.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Empty State */}
      {displayPolls.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            {activeTab === 'my' ? 'No polls yet' : 'Be the first!'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {activeTab === 'my' 
              ? 'Create your first poll and start gathering opinions' 
              : 'Start the conversation by creating the first poll'}
          </p>
          <a 
            href="/create" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
          >
            Create {activeTab === 'my' ? 'Your First' : 'First'} Poll
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
