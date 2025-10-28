'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Poll, WebSocketMessage } from '@/types/poll';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function useWebSocket(pollId: string) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const shouldReconnectRef = useRef(true);
  const pingIntervalRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!pollId || isConnectingRef.current || !shouldReconnectRef.current) return;

    // Close existing connection if any
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        return; // Already connected or connecting
      }
    }

    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/poll/${pollId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;

        // Send ping every 30 seconds to keep connection alive
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'initial_data':
              if (message.poll) {
                setPoll(message.poll);
                setViewerCount(message.viewer_count || 0);
              }
              break;

            case 'vote_update':
              setPoll((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  total_votes: message.total_votes || prev.total_votes,
                  options: prev.options.map((opt) =>
                    opt.id === message.option_id
                      ? { ...opt, vote_count: message.vote_count || opt.vote_count }
                      : opt
                  ),
                };
              });
              break;

            case 'like_update':
              setPoll((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  total_likes: message.total_likes || prev.total_likes,
                };
              });
              break;

            case 'viewer_count':
              setViewerCount(message.count || 0);
              break;

            case 'comment_update':
              // Notify comment section to add new comment
              if (message.comment && (window as any).addCommentToSection) {
                (window as any).addCommentToSection(message.comment);
              }
              break;

            case 'error':
              console.error('WebSocket error:', message.message);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        isConnectingRef.current = false;

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Only reconnect if we should (not during cleanup)
        if (shouldReconnectRef.current && reconnectAttemptsRef.current < 10) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      isConnectingRef.current = false;
    }
  }, [pollId]);

  useEffect(() => {
    shouldReconnectRef.current = true;
    
    // Only connect if not already connected
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      connect();
    }

    return () => {
      // Prevent reconnection during cleanup
      shouldReconnectRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
  }, [pollId]); // Only depend on pollId, not connect

  return { poll, isConnected, viewerCount };
}
