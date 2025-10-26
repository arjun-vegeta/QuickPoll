'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types/poll';
import { formatDate } from '@/lib/utils';
import { Heart, MessageSquare } from 'lucide-react';

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  return (
    <Link href={`/poll/${poll.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
          {poll.description && (
            <CardDescription className="line-clamp-2">{poll.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{poll.total_votes} votes</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{poll.total_likes}</span>
              </div>
            </div>
            <Badge variant="outline">{poll.options.length} options</Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {formatDate(poll.created_at)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
