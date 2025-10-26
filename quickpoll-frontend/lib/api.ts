import axios from "axios";
import { Poll, Vote, Like } from "@/types/poll";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const pollsApi = {
  getAll: async (): Promise<Poll[]> => {
    const response = await api.get("/polls/");
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
  }): Promise<Poll> => {
    const response = await api.post("/polls/", pollData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/polls/${id}`);
  },
};

export const votesApi = {
  create: async (voteData: Vote): Promise<any> => {
    const response = await api.post("/votes/", voteData);
    return response.data;
  },

  getUserVote: async (pollId: string, userId: string): Promise<any> => {
    const response = await api.get(`/votes/poll/${pollId}/user/${userId}`);
    return response.data;
  },
};

export const likesApi = {
  toggle: async (
    likeData: Like
  ): Promise<{ liked: boolean; total_likes: number }> => {
    const response = await api.post("/likes/", likeData);
    return response.data;
  },

  checkUserLike: async (
    pollId: string,
    userId: string
  ): Promise<{ liked: boolean }> => {
    const response = await api.get(`/likes/poll/${pollId}/user/${userId}`);
    return response.data;
  },
};

export const usersApi = {
  create: async (userData: {
    username: string;
    email: string;
  }): Promise<any> => {
    const response = await api.post("/polls/users", userData);
    return response.data;
  },
};

export const commentsApi = {
  getByPoll: async (pollId: string): Promise<any[]> => {
    const response = await api.get(`/comments/poll/${pollId}`);
    return response.data;
  },

  create: async (commentData: {
    poll_id: string;
    comment_text: string;
    post_anonymously?: boolean;
  }): Promise<any> => {
    const response = await api.post("/comments/", commentData);
    return response.data;
  },

  delete: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};

export default api;
