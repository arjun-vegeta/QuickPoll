"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IBM_Plex_Mono } from "next/font/google";
import Marquee from "react-fast-marquee";
import api from "@/lib/api";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
});

interface TrendingPoll {
  id: string;
  title: string;
}

// Helper component for a single poll card
const PollCard = ({
  poll,
  className,
  textSize,
}: {
  poll: TrendingPoll;
  className?: string;
  textSize: string;
}) => (
  <Link
    href={`/poll/${poll.id}`}
    className={`group relative flex-shrink-0 ${className}`}
  >
    <div className="w-full h-full bg-transparent border hover:border-2 border-white/70 hover:border-white rounded-2xl p-3 transition-all duration-300 flex items-center justify-center">
      <p
        className={`${textSize} font-normal text-white line-clamp-3 text-center`}
      >
        {poll.title}
      </p>

      {/* Hover Arrow */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ArrowUpRight className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
    </div>
  </Link>
);

export function HeroSection() {
  const [trendingPolls, setTrendingPolls] = useState<TrendingPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    let retryInterval: NodeJS.Timeout;
    let maxRetryTimeout: NodeJS.Timeout;
    let slowMessageTimeout: NodeJS.Timeout;

    // Fetch trending polls from backend
    const fetchTrendingPolls = async () => {
      try {
        const params = new URLSearchParams();
        params.append("sort_by", "votes");
        const response = await api.get(`/polls/?${params.toString()}`, {
          timeout: 5000, // 5 second timeout per request
        });
        const polls = response.data.slice(0, 12).map((poll: any) => ({
          id: poll.id,
          title: poll.title,
        }));
        setTrendingPolls(polls);
        setLoading(false);

        // Clear retry interval on success
        if (retryInterval) clearInterval(retryInterval);
        if (maxRetryTimeout) clearTimeout(maxRetryTimeout);
      } catch (error) {
        console.error("Error fetching trending polls, retrying...", error);
        setRetryCount((prev) => prev + 1);
      }
    };

    // Initial fetch
    fetchTrendingPolls();

    // Show "Server is starting" message after 2 seconds
    slowMessageTimeout = setTimeout(() => {
      setShowSlowMessage(true);
    }, 2000);

    // Retry every 1 second
    retryInterval = setInterval(() => {
      if (trendingPolls.length === 0) {
        fetchTrendingPolls();
      }
    }, 1000);

    // Stop retrying after 60 seconds
    maxRetryTimeout = setTimeout(() => {
      setLoading(false);
      if (retryInterval) clearInterval(retryInterval);
    }, 60000);

    return () => {
      if (retryInterval) clearInterval(retryInterval);
      if (maxRetryTimeout) clearTimeout(maxRetryTimeout);
      if (slowMessageTimeout) clearTimeout(slowMessageTimeout);
    };
  }, [trendingPolls.length]);

  const createGridPattern = () => {
    if (trendingPolls.length === 0) return [];

    const pattern = [];
    for (let i = 0; i < trendingPolls.length; i += 3) {
      pattern.push({
        type: "column",
        polls: [
          { poll: trendingPolls[i % trendingPolls.length], size: "small" },
          {
            poll: trendingPolls[(i + 1) % trendingPolls.length],
            size: "small",
          },
        ],
      });
      if (i + 2 < trendingPolls.length) {
        pattern.push({
          type: "column",
          polls: [
            {
              poll: trendingPolls[(i + 2) % trendingPolls.length],
              size: "large",
            },
          ],
        });
      }
    }
    return pattern;
  };

  const gridPattern = createGridPattern();
  const duplicatedPattern = [...gridPattern, ...gridPattern, ...gridPattern];

  return (
    <div className="relative w-screen min-h-screen bg-gradient-to-b from-black via-black to-[#10750B] text-white overflow-hidden flex flex-col">
      {/* Main Content Wrapper - Added pb-10 for bottom padding */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 z-10 pt-40 pb-10">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-12 lg:mb-16 space-y-4 md:space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`text-6xl md:text-8xl lg:text-[96px] font-bold tracking-tight ${ibmPlexMono.className}`}
          >
            QuickPoll
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-3xl md:text-5xl lg:text-[80px] text-white/90 font-light leading-tight"
          >
            Your Hub for Live Polling
          </motion.p>
        </div>

        {/* CTA Buttons - Always row, equal width, constrained on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="flex flex-row gap-4 sm:gap-6 w-full max-w-sm sm:w-auto sm:max-w-none"
        >
          <Link href="/polls" className="flex-1">
            <Button
              size="lg"
              variant="outline"
              className="group border-white/40 hover:bg-white text-white hover:text-black text-base md:text-lg font-semibold px-6 md:px-10 py-4 md:py-5 rounded-xl h-auto bg-transparent hover:border-white transition-all duration-200 w-full"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="mr-3 transition-all duration-200 group-hover:stroke-black"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Poll Now
            </Button>
          </Link>
          <Link href="/create" className="flex-1">
            <Button
              size="lg"
              className="bg-[#31E41D] hover:bg-[#28b817] text-black text-base md:text-lg font-semibold px-6 md:px-10 py-4 md:py-5 rounded-xl h-auto transition-all w-full"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="mr-3"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Create a Poll
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Infinite Marquee Grid Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative w-full z-0 overflow-hidden pt-10 pb-20"
      >
        {loading && trendingPolls.length === 0 ? (
          /* Loading State for Marquee */
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#31E41D] mx-auto"></div>
              {showSlowMessage ? (
                <>
                  <p className="text-white text-base font-mono">
                    Server is starting...
                  </p>
                  <p className="text-white/60 text-sm">
                    Please wait 40-60 seconds
                  </p>
                </>
              ) : (
                <p className="text-white/60 text-sm font-mono">
                  Loading Trending Polls
                </p>
              )}
            </div>
          </div>
        ) : trendingPolls.length === 0 ? (
          /* Empty State - only shown after timeout */
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-2">
              <p className="text-white/60 text-sm">Unable to load polls</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[#31E41D] text-sm hover:underline"
              >
                Refresh page
              </button>
            </div>
          </div>
        ) : (
          /* Scrolling Grid Container */
          <Marquee speed={160} gradient={false} pauseOnHover>
            {duplicatedPattern.map((column, columnIndex) => (
              <div
                key={`column-${columnIndex}`}
                className="flex flex-col gap-7 sm:gap-10 mx-3 lg:mx-5" // Vertical spacing + horizontal margin
              >
                {column.polls.map((item, pollIndex) => (
                  <PollCard
                    key={`poll-${columnIndex}-${pollIndex}`}
                    poll={item.poll}
                    // Updated responsive classes for size
                    className={
                      item.size === "large"
                        ? "w-[260px] h-[180px] sm:w-[300px] sm:h-[200px] lg:w-[360px]"
                        : "w-[260px] h-[76px] sm:w-[300px] sm:h-[80px] lg:w-[360px]"
                    }
                    // Updated responsive classes for text size
                    textSize={
                      item.size === "large"
                        ? "text-xl lg:text-[28px]"
                        : "text-base lg:text-lg"
                    }
                  />
                ))}
              </div>
            ))}
          </Marquee>
        )}
      </motion.div>

      {/* Footer */}
      <Footer transparent />
    </div>
  );
}
