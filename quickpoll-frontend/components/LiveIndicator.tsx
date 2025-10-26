'use client';

import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface LiveIndicatorProps {
  viewerCount: number;
  isConnected: boolean;
}

export function LiveIndicator({ viewerCount, isConnected }: LiveIndicatorProps) {
  return (
    <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-1">
      <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      <Eye className="h-3 w-3" />
      <span>{viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}</span>
    </Badge>
  );
}
