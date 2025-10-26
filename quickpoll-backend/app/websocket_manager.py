from fastapi import WebSocket
from typing import Dict, Set
import asyncio
import json

class ConnectionManager:
    def __init__(self):
        # Map poll_id to set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.event_queue: asyncio.Queue = asyncio.Queue()
        
    async def connect(self, websocket: WebSocket, poll_id: str):
        """Accept WebSocket connection and add to poll room"""
        await websocket.accept()
        if poll_id not in self.active_connections:
            self.active_connections[poll_id] = set()
        self.active_connections[poll_id].add(websocket)
        
        # Broadcast viewer count update
        await self.broadcast_viewer_count(poll_id)
        
    def disconnect(self, websocket: WebSocket, poll_id: str):
        """Remove WebSocket connection from poll room"""
        if poll_id in self.active_connections:
            self.active_connections[poll_id].discard(websocket)
            if not self.active_connections[poll_id]:
                del self.active_connections[poll_id]
    
    async def broadcast_to_poll(self, poll_id: str, message: dict):
        """Send message to all connections in a poll room"""
        if poll_id not in self.active_connections:
            return
            
        disconnected = set()
        for connection in self.active_connections[poll_id]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection, poll_id)
    
    async def broadcast_viewer_count(self, poll_id: str):
        """Broadcast current viewer count to all clients in poll"""
        if poll_id not in self.active_connections:
            return
            
        viewer_count = len(self.active_connections[poll_id])
        await self.broadcast_to_poll(poll_id, {
            "type": "viewer_count",
            "count": viewer_count
        })
    
    def get_viewer_count(self, poll_id: str) -> int:
        """Get current number of viewers for a poll"""
        return len(self.active_connections.get(poll_id, set()))

# Global connection manager instance
manager = ConnectionManager()
