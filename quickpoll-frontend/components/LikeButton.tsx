'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { likesApi } from '@/lib/api';
import { getUserId } from '@/lib/utils';

interface LikeButtonProps {
  pollId: string;
  totalLikes: number;
}

export function LikeButton({ pollId, totalLikes }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(totalLikes);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const userId = getUserId();
        const { liked: isLiked } = await likesApi.checkUserLike(pollId, userId);
        setLiked(isLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [pollId]);

  useEffect(() => {
    setLikes(totalLikes);
  }, [totalLikes]);

  const handleLike = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const userId = getUserId();
      
      const result = await likesApi.toggle({
        poll_id: pollId,
        user_id: userId,
      });

      setLiked(result.liked);
      setLikes(result.total_likes);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLike}
      disabled={isLoading}
      variant={liked ? 'default' : 'outline'}
      className="gap-2"
    >
      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
      <span>{likes}</span>
    </Button>
  );
}
