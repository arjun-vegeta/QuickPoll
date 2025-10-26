export interface PollOption {
  id: string;
  option_text: string;
  vote_count: number;
  position: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  total_votes: number;
  total_likes: number;
  options: PollOption[];
}

export interface Vote {
  poll_id: string;
  option_id: string;
  user_id: string;
}

export interface Like {
  poll_id: string;
  user_id: string;
}

export interface WebSocketMessage {
  type: 'initial_data' | 'vote_update' | 'like_update' | 'viewer_count' | 'error';
  poll?: Poll;
  poll_id?: string;
  option_id?: string;
  vote_count?: number;
  total_votes?: number;
  total_likes?: number;
  count?: number;
  viewer_count?: number;
  message?: string;
}
