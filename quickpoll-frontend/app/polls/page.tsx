"use client";

import { useEffect, useState, useMemo } from "react";
import { PollCard } from "@/components/PollCard";
import { Poll } from "@/types/poll";
import api from "@/lib/api";
import { isAuthenticated, getUser } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MessageSquare, Search, SlidersHorizontal } from "lucide-react";

const POLLS_PER_PAGE = 30;

const CATEGORIES = [
  "All",
  "Technology",
  "Sports",
  "Entertainment",
  "Politics",
  "Business",
  "Science",
  "Lifestyle",
  "General",
];

export default function PollsPage() {
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([]);
  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const user = isAuthenticated() ? getUser() : null;

  const handleDeletePoll = async (pollId: string) => {
    try {
      await api.delete(`/polls/${pollId}`);

      // Remove from all state arrays
      setAllPolls((prev) => prev.filter((p) => p.id !== pollId));
      setFilteredPolls((prev) => prev.filter((p) => p.id !== pollId));
      setMyPolls((prev) => prev.filter((p) => p.id !== pollId));
    } catch (error) {
      console.error("Error deleting poll:", error);
      alert("Failed to delete poll. Please try again.");
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPolls = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("sort_by", sortBy);
        if (category !== "All") params.append("category", category);
        if (activeSearch) params.append("search", activeSearch);

        const response = await api.get(`/polls/?${params.toString()}`);

        if (isMounted) {
          const data = response.data;
          setAllPolls(data);
          setFilteredPolls(data);

          // Filter user's polls if logged in
          if (user) {
            const userPolls = data.filter(
              (poll: Poll) => poll.creator_id === user.id
            );
            setMyPolls(userPolls);
          }
          setCurrentPage(1); // Reset to first page when filters change
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching polls:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPolls();

    return () => {
      isMounted = false;
    };
  }, [sortBy, category, activeSearch, user?.id]);

  useEffect(() => {
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Memoize display polls to prevent unnecessary recalculations
  const displayPolls = useMemo(() => {
    return activeTab === "my" ? myPolls : filteredPolls;
  }, [activeTab, myPolls, filteredPolls]);

  // Memoize pagination calculations
  const { totalPages, startIndex, endIndex, paginatedPolls } = useMemo(() => {
    const total = Math.ceil(displayPolls.length / POLLS_PER_PAGE);
    const start = (currentPage - 1) * POLLS_PER_PAGE;
    const end = start + POLLS_PER_PAGE;
    const paginated = displayPolls.slice(start, end);

    return {
      totalPages: total,
      startIndex: start,
      endIndex: end,
      paginatedPolls: paginated,
    };
  }, [displayPolls, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34CC41] mx-auto"></div>
          <p className="mt-4 text-[#A4A4A4]">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="text-center space-y-3 pt-8 pb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-[#E6E6E6]">
          {activeTab === "my" ? "My Polls" : "Discover Polls"}
        </h1>
        <p className="text-base text-[#A4A4A4] max-w-2xl mx-auto">
          {activeTab === "my"
            ? "Manage and track your created polls"
            : "Vote on polls and watch results update in real-time"}
        </p>
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex justify-center mb-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "all" | "my")}
            className="w-full max-w-md"
          >
            <TabsList className="grid w-full grid-cols-2 h-11 bg-[#1C1C1C] border border-[#323232]">
              <TabsTrigger
                value="all"
                className="text-sm font-medium text-[#E6E6E6] data-[state=active]:text-black data-[state=active]:bg-[#34CC41]"
              >
                All Polls{" "}
                <span className="ml-2 text-xs opacity-60">
                  ({allPolls.length})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="my"
                className="text-sm font-medium text-[#E6E6E6] data-[state=active]:text-black data-[state=active]:bg-[#34CC41]"
              >
                My Polls{" "}
                <span className="ml-2 text-xs opacity-60">
                  ({myPolls.length})
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="container mx-auto px-6 max-w-7xl mb-8">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Filters */}
          <div className="flex gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[160px] h-10 bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-[#A4A4A4]" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#323232] border-[1.5px]">
                {CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="text-[#E6E6E6] focus:bg-[#323232] focus:text-[#E6E6E6]"
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[160px] h-10 bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#323232] border-[1.5px]">
                <SelectItem
                  value="created_at"
                  className="text-[#E6E6E6] focus:bg-[#323232] focus:text-[#E6E6E6]"
                >
                  Latest
                </SelectItem>
                <SelectItem
                  value="votes"
                  className="text-[#E6E6E6] focus:bg-[#323232] focus:text-[#E6E6E6]"
                >
                  Most Votes
                </SelectItem>
                <SelectItem
                  value="likes"
                  className="text-[#E6E6E6] focus:bg-[#323232] focus:text-[#E6E6E6]"
                >
                  Most Likes
                </SelectItem>
                <SelectItem
                  value="comments"
                  className="text-[#E6E6E6] focus:bg-[#323232] focus:text-[#E6E6E6]"
                >
                  Most Comments
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A4A4A4]" />
              <Input
                type="text"
                placeholder="Search polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-10 bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] placeholder:text-[#A4A4A4] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#34CC41] text-black rounded-md hover:bg-[#2eb838] transition-colors flex items-center gap-2 h-10"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-6 max-w-7xl pb-12">
        {/* Empty State */}
        {displayPolls.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1C1C1C] border border-[#323232] flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-[#34CC41]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#E6E6E6] mb-2">
              {activeSearch
                ? "No polls found"
                : activeTab === "my"
                ? "No polls yet"
                : "Be the first!"}
            </h3>
            <p className="text-[#A4A4A4] mb-6 max-w-md mx-auto">
              {activeSearch
                ? "Try adjusting your search or filters"
                : activeTab === "my"
                ? "Create your first poll and start gathering opinions"
                : "Start the conversation by creating the first poll"}
            </p>
            {!activeSearch && (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#34CC41] text-black rounded-lg hover:bg-[#2eb838] hover:scale-105 transition-all duration-200 font-medium"
              >
                Create {activeTab === "my" ? "Your First" : "First"} Poll
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4 text-sm text-[#A4A4A4]">
              Showing {startIndex + 1}-{Math.min(endIndex, displayPolls.length)}{" "}
              of {displayPolls.length} polls
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {paginatedPolls.map((poll) => (
                <PollCard
                  key={`poll-${poll.id}`}
                  poll={poll}
                  showDelete={activeTab === "my"}
                  onDelete={handleDeletePoll}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* First page */}
                    {currentPage > 2 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(1)}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Ellipsis before current */}
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Previous page */}
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="cursor-pointer"
                        >
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Current page */}
                    <PaginationItem>
                      <PaginationLink isActive className="cursor-pointer">
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>

                    {/* Next page */}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="cursor-pointer"
                        >
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Ellipsis after current */}
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Last page */}
                    {currentPage < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
