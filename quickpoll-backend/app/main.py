from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
from uuid import UUID

from .database import get_db
from .websocket_manager import manager
from .routes import polls, votes, likes
from .services.poll_service import get_poll

app = FastAPI(title="QuickPoll API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(polls.router)
app.include_router(votes.router)
app.include_router(likes.router)

@app.get("/")
def read_root():
    return {"message": "QuickPoll API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/poll/{poll_id}")
async def websocket_endpoint(websocket: WebSocket, poll_id: str, db: Session = Depends(get_db)):
    """
    WebSocket endpoint for real-time poll updates
    Clients connect to receive live vote and like updates
    """
    await manager.connect(websocket, poll_id)
    
    try:
        # Send initial poll data
        try:
            poll = get_poll(db, UUID(poll_id))
            if poll:
                poll_data = {
                    "type": "initial_data",
                    "poll": {
                        "id": str(poll.id),
                        "title": poll.title,
                        "description": poll.description,
                        "total_votes": poll.total_votes,
                        "total_likes": poll.total_likes,
                        "options": [
                            {
                                "id": str(opt.id),
                                "option_text": opt.option_text,
                                "vote_count": opt.vote_count,
                                "position": opt.position
                            }
                            for opt in sorted(poll.options, key=lambda x: x.position)
                        ]
                    },
                    "viewer_count": manager.get_viewer_count(poll_id)
                }
                await websocket.send_json(poll_data)
        except Exception as e:
            await websocket.send_json({"type": "error", "message": str(e)})
        
        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_text()
            
            # Handle ping/pong for keep-alive
            if data == "ping":
                await websocket.send_text("pong")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, poll_id)
        # Broadcast updated viewer count
        await manager.broadcast_viewer_count(poll_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, poll_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
