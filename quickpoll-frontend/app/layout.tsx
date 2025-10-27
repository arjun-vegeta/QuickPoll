"use client";

import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from "react";
import { getUser, logout, isAuthenticated } from "@/lib/auth";
import { LogOut, User as UserIcon } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { usePathname } from "next/navigation";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setUser(getUser());
    window.location.reload();
  };

  const isHomePage = pathname === "/";

  // Prevent hydration mismatch by rendering consistent content on first render
  if (!mounted) {
    return (
      <html lang="en" className="scroll-smooth">
        <body className={ibmPlexSans.className}>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en" className="scroll-smooth">
      <body className={ibmPlexSans.className}>
        {isHomePage ? (
          // Full-screen layout for home page
          <>{children}</>
        ) : (
          // Regular layout with navbar for other pages
          <div className="min-h-screen bg-black">
            {/* Modern Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-lg bg-[#1C1C1C]/95 border-b border-[#323232]">
              <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <a href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-[#34CC41] flex items-center justify-center">
                      <span className="text-black font-bold text-sm">Q</span>
                    </div>
                    <span className="text-xl font-semibold text-[#E6E6E6]">
                      QuickPoll
                    </span>
                  </a>
                  <div className="flex items-center gap-3">
                    {user ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#323232] text-sm text-[#E6E6E6]">
                          <UserIcon className="h-3.5 w-3.5" />
                          <span className="font-medium">{user.username}</span>
                        </div>
                        <a
                          href="/create"
                          className="px-4 py-2 bg-[#34CC41] text-black rounded-lg hover:bg-[#2eb838] hover:scale-105 transition-all duration-200 font-medium text-sm"
                        >
                          Create Poll
                        </a>
                        <button
                          onClick={handleLogout}
                          className="px-3 py-2 text-[#A4A4A4] hover:text-[#E6E6E6] hover:bg-[#323232] rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="px-4 py-2 text-[#E6E6E6] hover:bg-[#323232] rounded-lg transition-colors font-medium text-sm"
                        >
                          Login
                        </button>
                        <a
                          href="/create"
                          className="px-4 py-2 bg-[#34CC41] text-black rounded-lg hover:bg-[#2eb838] hover:scale-105 transition-all duration-200 font-medium text-sm"
                        >
                          Create Poll
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="w-full">{children}</main>

            <AuthModal
              open={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              onSuccess={handleAuthSuccess}
            />
          </div>
        )}
      </body>
    </html>
  );
}
