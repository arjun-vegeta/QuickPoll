import axios from 'axios';
import { Poll, Vote, Like } from '@/types/poll';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pollsApi = {
  getAll: async (): Promise<Poll[]> => {
    const response = await api.get('/polls/');
    return response.data;
  },

  getById: async (id: string): Promise<Poll> => {
    const response = await api.get(`/polls/${id}`);
    return response.data;
  },

  create: async (pollData: {
    title: string;
    description?: string;
    options: { option_text: string; position: number }[];
    creator_id: string;
  }): Promise<Poll> => {
    const response = await api.post('/polls/', pollData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/polls/${id}`);
  },
};

export const votesApi = {
  create: async (voteData: Vote): Promise<any> => {
    const response = await api.post('/votes/', voteData);
    return response.data;
  },

  getUserVote: async (pollId: string, userId: string): Promise<any> => {
    const response = await api.get(`/votes/poll/${pollId}/user/${userId}`);
    return response.data;
  },
};

export const likesApi = {
  toggle: async (likeData: Like): Promise<{ liked: boolean; total_likes: number }> => {
    const response = await api.post('/likes/', likeData);
    return response.data;
  },

  checkUserLike: async (pollId: string, userId: string): Promise<{ liked: boolean }> => {
    const response = await api.get(`/likes/poll/${pollId}/user/${userId}`);
    return response.data;
  },
};

export const usersApi = {
  create: async (userData: { username: string; email: string }): Promise<any> => {
    const response = await api.post('/polls/users', userData);
    return response.data;
  },
};

export default api;
