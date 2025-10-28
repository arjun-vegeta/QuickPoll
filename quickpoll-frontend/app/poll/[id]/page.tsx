"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { LiveIndicator } from "@/components/LiveIndicator";
import { LikeButton } from "@/components/LikeButton";
import { ShareButton } from "@/components/ShareButton";
import { VoteButtons } from "@/components/VoteButtons";
import { LiveResults } from "@/components/LiveResults";
import { CommentsSection } from "@/components/CommentsSection";
import { useWebSocket } from "@/hooks/useWebSocket";
import { votesApi } from "@/lib/api";
import { getUserId } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Poll } from "@/types/poll";
import api from "@/lib/api";
import { Layers, BarChart3, Heart, MessageSquare, Trash2 } from "lucide-react";
import { isAuthenticated, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PollPage() {
  const params = useParams();
  const router = useRouter();
  const pollId = params.id as string;
  const [initialPoll, setInitialPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const { poll: wsPoll, isConnected, viewerCount } = useWebSocket(pollId);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [relatedPolls, setRelatedPolls] = useState<Poll[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = isAuthenticated() ? getUser() : null;
  
  // Use WebSocket data if available, otherwise use initial REST API data
  const poll = wsPoll || initialPoll;
  const isOwner = user && poll && poll.creator_id === user.id;

  const handleDeletePoll = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/polls/${pollId}`);
      router.push("/polls");
    } catch (error) {
      console.error("Error deleting poll:", error);
      alert("Failed to delete poll. Please try again.");
      setIsDeleting(false);
    }
  };

  // Fetch initial poll data via REST API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/polls/${pollId}`);
        setInitialPoll(response.data);
      } catch (error) {
        console.error("Error fetching poll:", error);
      } finally {
        setLoading(false);
      }
    };

    if (pollId) {
      fetchInitialData();
    }
  }, [pollId]);

  useEffect(() => {
    const checkUserVote = async () => {
      try {
        const userId = getUserId();
        const vote = await votesApi.getUserVote(pollId, userId);
        if (vote) {
          setUserVote(vote.option_id);
          setHasVoted(true);
        }
      } catch (error) {
        console.error("Error checking user vote:", error);
      }
    };

    if (pollId) {
      checkUserVote();
    }
  }, [pollId]);

  useEffect(() => {
    const fetchRelatedPolls = async () => {
      if (!poll?.category) {
        return;
      }

      try {
        setLoadingRelated(true);
        const params = new URLSearchParams();
        params.append("category", poll.category);
        params.append("sort_by", "votes");

        const response = await api.get(`/polls/?${params.toString()}`);
        const filtered = response.data
          .filter((p: Poll) => p.id !== pollId)
          .slice(0, 5);
        setRelatedPolls(filtered);
      } catch (error) {
        console.error("Error fetching related polls:", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (poll?.category && poll.id) {
      fetchRelatedPolls();
    }
  }, [poll?.category, poll?.id, pollId]);

  if (loading || !poll) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34CC41] mx-auto"></div>
          <p className="mt-4 text-[#A4A4A4]">Loading poll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/polls"
            className="inline-flex items-center gap-2 text-sm text-[#A4A4A4] hover:text-[#E6E6E6] transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            Back to polls
          </Link>
          <LiveIndicator viewerCount={viewerCount} isConnected={isConnected} />
        </div>

        {/* Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar - Related Polls (Desktop 1280px+ only) */}
          <aside className="hidden xl:block xl:col-span-3 space-y-4">
            <Card className="border-[#323232] border-[1.5px] bg-[#1C1C1C] sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-[#E6E6E6]">
                  <Layers className="h-5 w-5 text-[#34CC41]" />
                  Related Polls
                </CardTitle>
                <p className="text-xs text-[#A4A4A4]">
                  More from {poll.category}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingRelated ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-black border border-[#323232] rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : relatedPolls.length === 0 ? (
                  <p className="text-sm text-[#A4A4A4] text-center py-4">
                    No related polls found
                  </p>
                ) : (
                  relatedPolls.map((relatedPoll) => (
                    <Link
                      key={relatedPoll.id}
                      href={`/poll/${relatedPoll.id}`}
                      className="block p-3 rounded-lg bg-black border border-[#323232] hover:border-[#ffffff] transition-all group"
                    >
                      <h4 className="text-sm font-medium text-[#E6E6E6] line-clamp-2 group-hover:text-[#ffffff] transition-colors mb-3">
                        {relatedPoll.title}
                      </h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-xs text-[#A4A4A4]">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3 text-[#34CC41]" />
                            <span className="font-medium">
                              {relatedPoll.total_votes}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-[#34CC41]" />
                            <span className="font-medium">
                              {relatedPoll.total_likes}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-[#34CC41]" />
                            <span className="font-medium">
                              {relatedPoll.total_comments}
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Center - Main Poll Content */}
          <main className="md:col-span-7 lg:col-span-8 xl:col-span-6 space-y-6">
            <Card className="border-[#323232] border-[1.5px] shadow-lg shadow-black/20 bg-[#1C1C1C] overflow-hidden">
              <CardHeader className="relative space-y-4 pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#34CC41]/10 border border-[#34CC41] mb-2">
                      <span className="text-xs font-medium text-[#34CC41]">
                        {poll.category}
                      </span>
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-bold text-[#E6E6E6]">
                      {poll.title}
                    </CardTitle>
                    {poll.description && (
                      <CardDescription className="text-base text-[#A4A4A4] leading-relaxed">
                        {poll.description}
                      </CardDescription>
                    )}
                    <p className="text-sm text-[#A4A4A4] font-medium">
                      Created {formatDate(poll.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <LikeButton
                      pollId={poll.id}
                      totalLikes={poll.total_likes}
                    />
                    <ShareButton pollId={poll.id} pollTitle={poll.title} />
                    {isOwner && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-[1.5px] bg-black border-[#323232] text-[#A4A4A4] hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1C1C1C] border-[#323232] border-[1.5px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#E6E6E6]">
                              Delete Poll
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-[#A4A4A4]">
                              Are you sure you want to delete this poll? This
                              action cannot be undone. All votes, likes, and
                              comments will be permanently deleted.
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
                              onClick={handleDeletePoll}
                              disabled={isDeleting}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-8">
                {/* Voting Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-[#34CC41]" />
                    <h3 className="text-lg font-semibold text-[#E6E6E6]">
                      {hasVoted ? "Your Vote" : "Cast Your Vote"}
                    </h3>
                  </div>
                  <VoteButtons
                    pollId={poll.id}
                    options={poll.options}
                    userVote={userVote}
                    onVoteSuccess={() => setHasVoted(true)}
                  />
                </div>

                {/* Results Section */}
                <div className="space-y-4 pt-6 border-t border-[#323232]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-[#34CC41]" />
                      <h3 className="text-lg font-semibold text-[#E6E6E6]">
                        Live Results
                      </h3>
                    </div>
                    <span className="text-sm text-[#A4A4A4] font-medium">
                      {poll.total_votes}{" "}
                      {poll.total_votes === 1 ? "vote" : "votes"}
                    </span>
                  </div>
                  <LiveResults
                    options={poll.options}
                    totalVotes={poll.total_votes}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Related Polls - Tablet only (768px-1279px, shown at bottom of main content) */}
            <div className="hidden md:block xl:hidden">
              <Card className="border-[#323232] border-[1.5px] bg-[#1C1C1C]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#E6E6E6]">
                    <Layers className="h-5 w-5 text-[#34CC41]" />
                    Related Polls
                  </CardTitle>
                  <p className="text-xs text-[#A4A4A4]">
                    More from {poll.category}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingRelated ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-black border border-[#323232] rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  ) : relatedPolls.length === 0 ? (
                    <p className="text-sm text-[#A4A4A4] text-center py-4">
                      No related polls found
                    </p>
                  ) : (
                    relatedPolls.map((relatedPoll) => (
                      <Link
                        key={relatedPoll.id}
                        href={`/poll/${relatedPoll.id}`}
                        className="block p-3 rounded-lg bg-black border border-[#323232] hover:border-[#ffffff] transition-all group"
                      >
                        <h4 className="text-sm font-medium text-[#E6E6E6] line-clamp-2 group-hover:text-[#ffffff] transition-colors mb-3">
                          {relatedPoll.title}
                        </h4>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3 text-xs text-[#A4A4A4]">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3 text-[#34CC41]" />
                              <span className="font-medium">
                                {relatedPoll.total_votes}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-[#34CC41]" />
                              <span className="font-medium">
                                {relatedPoll.total_likes}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3 text-[#34CC41]" />
                              <span className="font-medium">
                                {relatedPoll.total_comments}
                              </span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </main>

          {/* Right Sidebar - Comments (Tablet 768px+ and Desktop) */}
          <aside className="hidden md:block md:col-span-5 lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6">
              <CommentsSection pollId={pollId} />
            </div>
          </aside>

          {/* Comments Section - Mobile Only (below 768px) */}
          <div className="md:hidden">
            <CommentsSection pollId={pollId} />
          </div>

          {/* Related Polls - Mobile only (below 768px, shown after comments) */}
          <div className="md:hidden">
            <Card className="border-[#323232] border-[1.5px] bg-[#1C1C1C]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-[#E6E6E6]">
                  <Layers className="h-5 w-5 text-[#34CC41]" />
                  Related Polls
                </CardTitle>
                <p className="text-xs text-[#A4A4A4]">
                  More from {poll.category}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingRelated ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-black border border-[#323232] rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : relatedPolls.length === 0 ? (
                  <p className="text-sm text-[#A4A4A4] text-center py-4">
                    No related polls found
                  </p>
                ) : (
                  relatedPolls.map((relatedPoll) => (
                    <Link
                      key={relatedPoll.id}
                      href={`/poll/${relatedPoll.id}`}
                      className="block p-3 rounded-lg bg-black border border-[#323232] hover:border-[#ffffff] transition-all group"
                    >
                      <h4 className="text-sm font-medium text-[#E6E6E6] line-clamp-2 group-hover:text-[#ffffff] transition-colors mb-3">
                        {relatedPoll.title}
                      </h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-xs text-[#A4A4A4]">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3 text-[#34CC41]" />
                            <span className="font-medium">
                              {relatedPoll.total_votes}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-[#34CC41]" />
                            <span className="font-medium">
                              {relatedPoll.total_likes}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-[#34CC41]" />
                            <span className="font-medium">
                              {relatedPoll.total_comments}
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
