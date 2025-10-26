'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commentsApi } from '@/lib/api';
import { isAuthenticated, getUser } from '@/lib/auth';
import { MessageSquare, Trash2 } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Add a comment..." : "Post as Anonymous User"}
              maxLength={1000}
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
          {user && (
            <div className="flex items-center gap-2 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={postAnonymously}
                  onChange={(e) => setPostAnonymously(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-muted-foreground">
                  Post anonymously
                </span>
              </label>
              <span className="text-xs text-muted-foreground">
                {postAnonymously ? '(as Anonymous User)' : `(as ${user.username})`}
              </span>
            </div>
          )}
          {!user && (
            <p className="text-xs text-muted-foreground mt-2">
              You're posting as Anonymous User
            </p>
          )}
        </form>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {comment.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.comment_text}</p>
                  </div>
                  {user && comment.user_id === user.id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
