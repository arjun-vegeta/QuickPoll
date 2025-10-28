"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Poll } from "@/types/poll";
import { formatDate } from "@/lib/utils";
import { Heart, MessageSquare, BarChart3, Trash2 } from "lucide-react";

interface PollCardProps {
  poll: Poll;
  showDelete?: boolean;
  onDelete?: (pollId: string) => void;
}

export function PollCard({ poll, showDelete = false, onDelete }: PollCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(poll.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting poll:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Link href={`/poll/${poll.id}`} className="group block h-full" prefetch={true}>
        <Card className="h-full border-[#323232] border-[1.5px] hover:border-[#ffffff] hover:shadow-xl hover:shadow-[#34CC41]/10 transition-all duration-300 overflow-hidden bg-[#1C1C1C] flex flex-col">
          <CardHeader className="relative space-y-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <Badge
                variant="outline"
                className="text-xs font-medium border-[#323232] text-[#A4A4A4] bg-transparent"
              >
                {poll.category}
              </Badge>
              {showDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-7 w-7 text-[#A4A4A4] hover:text-red-500 hover:bg-red-500/10 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
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

          <CardContent className="relative space-y-3 mt-auto">
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#1C1C1C] border-[#323232] border-[1.5px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E6E6E6]">Delete Poll</AlertDialogTitle>
            <AlertDialogDescription className="text-[#A4A4A4]">
              Are you sure you want to delete "{poll.title}"? This action cannot be undone.
              All votes, likes, and comments will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-black border-[#323232] text-[#E6E6E6] hover:bg-[#323232]"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
