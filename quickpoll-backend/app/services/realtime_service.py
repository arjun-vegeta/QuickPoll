from ..websocket_manager import manager
from uuid import UUID

async def broadcast_vote_update(poll_id: UUID, option_id: UUID, new_vote_count: int, total_votes: int):
    """Broadcast vote update to all connected clients"""
    await manager.broadcast_to_poll(str(poll_id), {
        "type": "vote_update",
        "poll_id": str(poll_id),
        "option_id": str(option_id),
        "vote_count": new_vote_count,
        "total_votes": total_votes
    })

async def broadcast_like_update(poll_id: UUID, total_likes: int):
    """Broadcast like count update to all connected clients"""
    await manager.broadcast_to_poll(str(poll_id), {
        "type": "like_update",
        "poll_id": str(poll_id),
        "total_likes": total_likes
    })

async def send_poll_data(poll_id: UUID, poll_data: dict):
    """Send complete poll data to all connected clients"""
    await manager.broadcast_to_poll(str(poll_id), {
        "type": "poll_data",
        "data": poll_data
    })

async def broadcast_comment_update(poll_id: UUID, comment_data: dict):
    """Broadcast new comment to all connected clients"""
    await manager.broadcast_to_poll(str(poll_id), {
        "type": "comment_update",
        "poll_id": str(poll_id),
        "comment": comment_data
    })
