import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a simple user ID (in production, use proper auth)
export function getUserId(): string {
  let userId = localStorage.getItem('quickpoll_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('quickpoll_user_id', userId);
  }
  return userId;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculatePercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}
