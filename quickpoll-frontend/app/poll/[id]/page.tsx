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
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <a href="/" className="text-primary hover:underline">
          ← Back to polls
        </a>
        <LiveIndicator viewerCount={viewerCount} isConnected={isConnected} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription className="text-base">{poll.description}</CardDescription>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Created {formatDate(poll.created_at)}
              </p>
            </div>
            <LikeButton pollId={poll.id} totalLikes={poll.total_likes} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {hasVoted ? 'Your Vote' : 'Cast Your Vote'}
            </h3>
            <VoteButtons
              pollId={poll.id}
              options={poll.options}
              userVote={userVote}
              onVoteSuccess={() => setHasVoted(true)}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Live Results ({poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'})
            </h3>
            <LiveResults options={poll.options} totalVotes={poll.total_votes} />
          </div>
        </CardContent>
      </Card>

      <CommentsSection pollId={pollId} />
    </div>
  );
}
