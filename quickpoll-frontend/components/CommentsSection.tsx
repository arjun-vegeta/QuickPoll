'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { commentsApi } from '@/lib/api';
import { isAuthenticated, getUser } from '@/lib/auth';
import { MessageSquare, Trash2, User } from 'lucide-react';
import { Comment } from '@/types/poll';

interface CommentsSectionProps {
  pollId: string;
  onNewComment?: (comment: Comment) => void;
}

export function CommentsSection({ pollId, onNewComment }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postAnonymously, setPostAnonymously] = useState(false);
  const user = isAuthenticated() ? getUser() : null;

  useEffect(() => {
    fetchComments();
  }, [pollId]);

  const fetchComments = async () => {
    try {
      const data = await commentsApi.getByPoll(pollId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
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
      setNewComment('');
      onNewComment?.(comment);
    } catch (error: any) {
      console.error('Error posting comment:', error);
      if (error.response?.status === 401) {
        alert('Please login to comment');
      } else {
        alert('Failed to post comment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await commentsApi.delete(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="border-slate-200 shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          Comments
          <span className="text-sm font-normal text-slate-500">({comments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-6 p-4 rounded-xl bg-slate-50/50 border border-slate-200">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Share your thoughts..." : "Post as Anonymous User"}
            maxLength={1000}
            rows={3}
            className="resize-none border-slate-200 focus:border-blue-300 bg-white"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={postAnonymously}
                    onCheckedChange={(checked) => setPostAnonymously(checked as boolean)}
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium leading-none cursor-pointer text-slate-700"
                  >
                    Post anonymously
                  </label>
                </div>
              )}
              <span className="text-xs text-slate-500 font-medium">
                {user 
                  ? (postAnonymously ? 'as Anonymous' : `as ${user.username}`)
                  : 'as Anonymous'
                }
              </span>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg transition-all"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>

        <Separator className="my-6 bg-slate-200" />

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {comments.map((comment, index) => (
                <div key={comment.id}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {comment.username === 'Anonymous User' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          comment.username.charAt(0).toUpperCase()
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {comment.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        {user && comment.user_id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(comment.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {comment.comment_text}
                      </p>
                    </div>
                  </div>
                  {index < comments.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
