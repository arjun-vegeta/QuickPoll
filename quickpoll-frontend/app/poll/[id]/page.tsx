'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LiveIndicator } from '@/components/LiveIndicator';
import { LikeButton } from '@/components/LikeButton';
import { VoteButtons } from '@/components/VoteButtons';
import { LiveResults } from '@/components/LiveResults';
import { CommentsSection } from '@/components/CommentsSection';
import { useWebSocket } from '@/hooks/useWebSocket';
import { votesApi } from '@/lib/api';
import { getUserId } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

export default function PollPage() {
  const params = useParams();
  const pollId = params.id as string;
  const { poll, isConnected, viewerCount } = useWebSocket(pollId);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const checkUserVote = async () => {
      try {
        const userId = getUserId();
        const vote = await votesApi.getUserVote(pollId, userId);
        if (vote) {
          setUserVote(vote.option_id);
          setHasVoted(true);
        }
      } catch (error) {
        console.error('Error checking user vote:', error);
      }
    };

    if (pollId) {
      checkUserVote();
    }
  }, [pollId]);

  if (!poll) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading poll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <a 
          href="/polls" 
          className="inline-flex items-center gap-2 text-sm text-[#A4A4A4] hover:text-[#E6E6E6] transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to polls
        </a>
        <LiveIndicator viewerCount={viewerCount} isConnected={isConnected} />
      </div>

      {/* Main Poll Card */}
      <Card className="border-[#323232] border-[1.5px] shadow-lg shadow-black/20 bg-[#1C1C1C] overflow-hidden">
        
        <CardHeader className="relative space-y-4 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <CardTitle className="text-4xl font-bold text-[#E6E6E6]">
                {poll.title}
              </CardTitle>
              {poll.description && (
                <CardDescription className="text-base text-[#A4A4A4] leading-relaxed">
                  {poll.description}
                </CardDescription>
              )}
              <p className="text-sm text-[#A4A4A4] font-medium">
                Created {formatDate(poll.created_at)}
              </p>
            </div>
            <LikeButton pollId={poll.id} totalLikes={poll.total_likes} />
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-8">
          {/* Voting Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#34CC41]" />
              <h3 className="text-lg font-semibold text-[#E6E6E6]">
                {hasVoted ? 'Your Vote' : 'Cast Your Vote'}
              </h3>
            </div>
            <VoteButtons
              pollId={poll.id}
              options={poll.options}
              userVote={userVote}
              onVoteSuccess={() => setHasVoted(true)}
            />
          </div>

          {/* Results Section */}
          <div className="space-y-4 pt-6 border-t border-[#323232]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#34CC41]" />
                <h3 className="text-lg font-semibold text-[#E6E6E6]">
                  Live Results
                </h3>
              </div>
              <span className="text-sm text-[#A4A4A4] font-medium">
                {poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}
              </span>
            </div>
            <LiveResults options={poll.options} totalVotes={poll.total_votes} />
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <CommentsSection pollId={pollId} />
    </div>
  );
}
