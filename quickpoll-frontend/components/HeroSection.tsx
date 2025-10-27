"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IBM_Plex_Mono } from "next/font/google";
import Marquee from "react-fast-marquee";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
});

interface TrendingPoll {
  id: string;
  title: string;
}

const TRENDING_POLLS: TrendingPoll[] = [
  { id: "1", title: "Will AI replace developers?" },
  { id: "2", title: "Is RCB the best IPL team?" },
  { id: "3", title: "Should Lyzr AI hire Arjun as a Full-Stack Developer?" },
  { id: "4", title: "Is Quick Poll the best polling platform?" },
  { id: "5", title: "Claude or Gemini, which is the best?" },
  { id: "6", title: "Can Lyzr AI beat salesforce's Agentforce platform" },
  { id: "7", title: "Is TypeScript better than JavaScript?" },
  { id: "8", title: "Should remote work be the default?" },
  { id: "9", title: "Is Next.js the best React framework?" },
  { id: "10", title: "Will quantum computing change everything?" },
  { id: "11", title: "Is Python still relevant in 2024?" },
  { id: "12", title: "Should startups focus on AI first?" },
];

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createGridPattern = () => {
    const pattern = [];
    for (let i = 0; i < TRENDING_POLLS.length; i += 3) {
      pattern.push({
        type: "column",
        polls: [
          { poll: TRENDING_POLLS[i % TRENDING_POLLS.length], size: "small" },
          {
            poll: TRENDING_POLLS[(i + 1) % TRENDING_POLLS.length],
            size: "small",
          },
        ],
      });
      if (i + 2 < TRENDING_POLLS.length) {
        pattern.push({
          type: "column",
          polls: [
            {
              poll: TRENDING_POLLS[(i + 2) % TRENDING_POLLS.length],
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

  if (!mounted) {
    return <div className="w-screen h-screen bg-black" />;
  }

  return (
    <div className="relative w-screen min-h-screen bg-gradient-to-b from-black via-black to-[#10750B] text-white overflow-hidden flex flex-col">
      {/* Main Content Wrapper - Added pb-10 for bottom padding */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 z-10 pt-40 pb-10">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-12 lg:mb-16 space-y-4 md:space-y-6">
          <h1
            className={`text-6xl md:text-8xl lg:text-[96px] font-bold tracking-tight ${ibmPlexMono.className}`}
          >
            QuickPoll
          </h1>
          <p className="text-3xl md:text-5xl lg:text-[80px] text-white/90 font-light leading-tight">
            Your Hub for Live Polling
          </p>
        </div>

        {/* CTA Buttons - Always row, equal width, constrained on mobile */}
        <div className="flex flex-row gap-4 sm:gap-6 w-full max-w-sm sm:w-auto sm:max-w-none">
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
        </div>
      </div>

      {/* Infinite Marquee Grid Section */}
      <div className="relative w-full z-0 overflow-hidden pt-10 pb-32">
        {/* Scrolling Grid Container */}
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
      </div>
    </div>
  );
}
