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
  category: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  total_votes: number;
  total_likes: number;
  total_comments: number;
  creator_id: string;
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

export interface Comment {
  id: string;
  poll_id: string;
  user_id?: string;
  username: string;
  comment_text: string;
  created_at: string;
}

export interface WebSocketMessage {
  type: 'initial_data' | 'vote_update' | 'like_update' | 'viewer_count' | 'comment_update' | 'error';
  poll?: Poll;
  poll_id?: string;
  option_id?: string;
  vote_count?: number;
  total_votes?: number;
  total_likes?: number;
  count?: number;
  viewer_count?: number;
  comment?: Comment;
  message?: string;
}
