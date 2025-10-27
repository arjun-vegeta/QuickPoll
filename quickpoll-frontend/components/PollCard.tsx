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
    <Link href={`/poll/${poll.id}`} className="group">
      <Card className="h-full border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="relative space-y-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {poll.title}
            </CardTitle>
            <Badge variant="secondary" className="shrink-0 bg-slate-100 text-slate-700 border-0">
              {poll.options.length}
            </Badge>
          </div>
          {poll.description && (
            <CardDescription className="line-clamp-2 text-sm text-slate-600">
              {poll.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="relative space-y-3">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-medium">{poll.total_votes}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              <span className="font-medium">{poll.total_likes}</span>
            </div>
          </div>
          
          <div className="text-xs text-slate-500 font-medium">
            {formatDate(poll.created_at)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
