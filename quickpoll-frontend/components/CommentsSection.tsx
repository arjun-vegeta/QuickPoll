"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { commentsApi } from "@/lib/api";
import { isAuthenticated, getUser } from "@/lib/auth";
import { MessageSquare, Trash2, User } from "lucide-react";
import { Comment } from "@/types/poll";

interface CommentsSectionProps {
  pollId: string;
  onNewComment?: (comment: Comment) => void;
}

export function CommentsSection({
  pollId,
  onNewComment,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = isAuthenticated() ? getUser() : null;

  useEffect(() => {
    fetchComments();
  }, [pollId]);

  const fetchComments = async () => {
    try {
      const data = await commentsApi.getByPoll(pollId);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const comment = await commentsApi.create({
        poll_id: pollId,
        comment_text: newComment.trim(),
        post_anonymously: postAnonymously,
      });

      setComments([comment, ...comments]);
      setNewComment("");
      onNewComment?.(comment);
    } catch (error: any) {
      console.error("Error posting comment:", error);
      if (error.response?.status === 401) {
        alert("Please login to comment");
      } else {
        alert("Failed to post comment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      setIsDeleting(true);
      await commentsApi.delete(commentToDelete);
      setComments(comments.filter((c) => c.id !== commentToDelete));
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const addComment = (comment: Comment) => {
    setComments([comment, ...comments]);
  };

  // Expose addComment method
  useEffect(() => {
    (window as any).addCommentToSection = addComment;
    return () => {
      delete (window as any).addCommentToSection;
    };
  }, [comments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Card className="border-[#323232] border-[1.5px] shadow-lg shadow-black/20 bg-[#1C1C1C] h-full flex flex-col">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-[#34CC41]" />
            </div>
            <span className="text-[#E6E6E6]">Comments</span>
            <span className="text-sm font-normal text-[#A4A4A4]">
              ({comments.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Comment Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3 mb-4 p-3 rounded-lg bg-black border border-[#323232]"
          >
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                user ? "Share your thoughts..." : "Post as Anonymous User"
              }
              maxLength={1000}
              rows={2}
              className="resize-none border-[#323232] border-[1.5px] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#1C1C1C] text-[#E6E6E6] placeholder:text-[#A4A4A4] text-sm"
            />
            <div className="flex flex-col gap-2">
              {user && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={postAnonymously}
                    onCheckedChange={(checked) =>
                      setPostAnonymously(checked as boolean)
                    }
                    className="border-[#323232] data-[state=checked]:bg-[#34CC41] data-[state=checked]:border-[#34CC41]"
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-xs font-medium leading-none cursor-pointer text-[#E6E6E6]"
                  >
                    Post anonymously
                  </label>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A4A4A4] font-medium">
                  {user
                    ? postAnonymously
                      ? "Post as Anonymous"
                      : `Post as ${user.username}`
                    : "Post as Anonymous"}
                </span>
                <Button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="bg-[#34CC41] text-black hover:bg-[#2eb838] transition-all h-8"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </form>

          <Separator className="my-4 bg-[#323232]" />

          {/* Comments List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-16 bg-[#1C1C1C] border border-[#323232] rounded"></div>
                <div className="h-16 bg-[#1C1C1C] border border-[#323232] rounded"></div>
                <div className="h-16 bg-[#1C1C1C] border border-[#323232] rounded"></div>
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-[#A4A4A4] mb-3" />
              <p className="text-[#A4A4A4]">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-3 xl:max-h-[calc(100vh-400px)]">
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={comment.id}>
                    <div className="flex items-start gap-2">
                      <Avatar className="h-7 w-7 border border-[#323232] shrink-0">
                        <AvatarFallback className="bg-[#34CC41]/10 text-[#34CC41] text-xs">
                          {comment.username === "Anonymous User" ? (
                            <User className="h-3 w-3" />
                          ) : (
                            comment.username.charAt(0).toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-[#E6E6E6] truncate">
                              {comment.username}
                            </span>
                            <span className="text-xs text-[#A4A4A4]">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          {user && comment.user_id === user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(comment.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-[#E6E6E6] leading-relaxed break-words">
                          {comment.comment_text}
                        </p>
                      </div>
                    </div>
                    {index < comments.length - 1 && (
                      <Separator className="mt-4 bg-[#323232]" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1C1C1C] border-[#323232] border-[1.5px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E6E6E6]">
              Delete Comment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#A4A4A4]">
              Are you sure you want to delete this comment? This action cannot
              be undone.
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
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
