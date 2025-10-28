'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PollOption } from '@/types/poll';
import { votesApi } from '@/lib/api';
import { getUserId } from '@/lib/utils';
import { Check } from 'lucide-react';

interface VoteButtonsProps {
  pollId: string;
  options: PollOption[];
  userVote?: string | null;
  onVoteSuccess?: () => void;
}

export function VoteButtons({ pollId, options, userVote, onVoteSuccess }: VoteButtonsProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(userVote || null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (optionId: string) => {
    if (isVoting) return;

    try {
      setIsVoting(true);
      const userId = getUserId();
      
      await votesApi.create({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
      });

      setSelectedOption(optionId);
      onVoteSuccess?.();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="space-y-3">
      {options.sort((a, b) => a.position - b.position).map((option) => {
        const isSelected = selectedOption === option.id;
        
        return (
          <Button
            key={option.id}
            onClick={() => handleVote(option.id)}
            disabled={isVoting}
            variant={isSelected ? 'default' : 'outline'}
            className={`w-full justify-between text-left h-auto py-4 px-5 border-[1.5px] transition-all ${
              isSelected 
                ? 'bg-[#34CC41] border-[#34CC41] text-black hover:bg-[#2eb838] hover:border-[#2eb838]' 
                : 'bg-black border-[#323232] text-[#E6E6E6] hover:border-[#34CC41] hover:bg-[#34CC41]/10 hover:text-white'
            }`}
          >
            <span className="font-medium">{option.option_text}</span>
            {isSelected && <Check className="h-5 w-5" />}
          </Button>
        );
      })}
    </div>
  );
}
