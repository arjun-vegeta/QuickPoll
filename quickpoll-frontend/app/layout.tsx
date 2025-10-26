import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickPoll - Real-time Polling",
  description: "Create and vote on polls with live results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <nav className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <a href="/" className="text-2xl font-bold text-primary">
                  QuickPoll
                </a>
                <a 
                  href="/create" 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Create Poll
                </a>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
