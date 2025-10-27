"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Poll } from "@/types/poll";
import { formatDate } from "@/lib/utils";
import { Heart, MessageSquare, BarChart3 } from "lucide-react";

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  return (
    <Link href={`/poll/${poll.id}`} className="group">
      <Card className="h-full border-[#323232] border-[1.5px] hover:border-[#ffffff] hover:shadow-xl hover:shadow-[#34CC41]/10 transition-all duration-300 overflow-hidden bg-[#1C1C1C]">
        <CardHeader className="relative space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="text-xs font-medium border-[#323232] text-[#A4A4A4] bg-transparent"
            >
              {poll.category}
            </Badge>
          </div>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg font-semibold text-[#E6E6E6] group-hover:text-[#E6E6E6] transition-colors">
              {poll.title}
            </CardTitle>
            <Badge
              variant="secondary"
              className="shrink-0 bg-[#323232] text-[#A4A4A4] border-0"
            >
              {poll.options.length}
            </Badge>
          </div>
          {poll.description && (
            <CardDescription className="line-clamp-2 text-sm text-[#A4A4A4]">
              {poll.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="relative space-y-3">
          <div className="flex items-center gap-4 text-sm text-[#A4A4A4]">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-[#34CC41]" />
              <span className="font-medium">{poll.total_votes} votes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-[#34CC41]" />
              <span className="font-medium">{poll.total_likes}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-[#34CC41]" />
              <span className="font-medium">{poll.total_comments}</span>
            </div>
          </div>

          <div className="text-xs text-[#A4A4A4] font-medium">
            {formatDate(poll.created_at)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
