'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  pollId: string;
  pollTitle: string;
}

export function ShareButton({ pollId, pollTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/poll/${pollId}`;
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: pollTitle,
          text: `Vote on: ${pollTitle}`,
          url: url,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred, fall back to copy
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            onClick={handleShare}
            variant="outline"
            size="icon"
            className={`border-[1.5px] transition-all ${
              copied
                ? 'bg-[#34CC41] border-[#34CC41] text-black'
                : 'bg-black border-[#323232] text-[#E6E6E6] hover:border-[#34CC41] hover:text-[#34CC41]'
            }`}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-[#1C1C1C] border-[#323232] text-[#E6E6E6]">
          <p>{copied ? 'Link copied!' : 'Share this poll'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
