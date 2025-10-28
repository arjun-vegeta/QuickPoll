'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye } from 'lucide-react';

interface LiveIndicatorProps {
  viewerCount: number;
  isConnected: boolean;
}

export function LiveIndicator({ viewerCount, isConnected }: LiveIndicatorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant={isConnected ? 'default' : 'secondary'} 
            className={`gap-1.5 cursor-help border-[1.5px] ${
              isConnected 
                ? 'bg-[#34CC41]/10 border-[#34CC41] text-[#34CC41]' 
                : 'bg-[#1C1C1C] border-[#323232] text-[#A4A4A4]'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#34CC41] animate-pulse' : 'bg-[#A4A4A4]'}`} />
            <Eye className="h-3 w-3" />
            <span>{viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-[#1C1C1C] border-[#323232] text-[#E6E6E6]">
          <p>{isConnected ? 'Connected - Live updates enabled' : 'Reconnecting...'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
