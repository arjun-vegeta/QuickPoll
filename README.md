# QuickPoll - Real-time Polling Platform

A real-time polling platform built with FastAPI, Next.js, PostgreSQL, and WebSockets.

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, WebSockets
- **Database:** PostgreSQL 16 (Docker)
- **Frontend:** Next.js 14, TypeScript, shadcn/ui, Tailwind CSS
- **Real-time:** Native WebSockets with asyncio pub/sub

## Prerequisites

- Node.js v23.6.1
- Python 3.11.8
- npm 10.9.2
- Docker 

## Installation

### 1. Install Docker

Docker is required to run PostgreSQL. Install it from:
- **macOS:** https://docs.docker.com/desktop/install/mac-install/

After installation, start Docker Desktop.

### 2. Setup Backend

```bash
cd quickpoll-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL with Docker
docker-compose up -d

# Wait for PostgreSQL to be ready (about 10 seconds)
sleep 10

# Create database tables
python -c "from app.database import Base, engine; Base.metadata.create_all(engine)"

# Start backend server
uvicorn app.main:app --reload --port 8000
```

The backend will be running at http://localhost:8000

### 3. Setup Frontend (in a new terminal)

```bash
cd quickpoll-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be running at http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Click "Create Poll" to create a new poll
3. Open the poll in multiple browser tabs to test real-time updates
4. Vote from one tab and watch the results update instantly in other tabs
5. Click the heart icon to like/unlike polls
6. See live viewer count for each poll

## Features

- ✅ Real-time vote updates via WebSockets
- ✅ Live viewer count
- ✅ Like/unlike polls
- ✅ Vote changing (users can change their vote)
- ✅ Animated charts with live data
- ✅ Responsive design
- ✅ Auto-reconnect on connection loss
- ✅ Atomic database operations (no race conditions)

## Project Structure

```
quickpoll-backend/
├── app/
│   ├── main.py              # FastAPI app + WebSocket
│   ├── database.py          # PostgreSQL connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── websocket_manager.py # WebSocket connection manager
│   ├── routes/              # API endpoints
│   └── services/            # Business logic
├── docker-compose.yml       # PostgreSQL container
└── requirements.txt

quickpoll-frontend/
├── app/                     # Next.js pages
├── components/              # React components
├── hooks/                   # Custom hooks
├── lib/                     # Utilities
└── types/                   # TypeScript types
```

## API Endpoints

- `GET /polls/` - List all polls
- `GET /polls/{id}` - Get poll by ID
- `POST /polls/` - Create new poll
- `POST /votes/` - Submit/change vote
- `POST /likes/` - Toggle like
- `WS /ws/poll/{id}` - WebSocket connection for real-time updates

## Testing

Open http://localhost:3000 and verify:
- [ ] Create poll with 3+ options
- [ ] Open poll in 3 different browser tabs
- [ ] Vote from tab 1 → verify instant update in tabs 2 & 3
- [ ] Change vote from tab 2 → verify update everywhere
- [ ] Click like from tab 3 → verify counter updates
- [ ] Close tab 1 → verify viewer count decreases
- [ ] Vote counts persist after page refresh
- [ ] WebSocket reconnects after temporary disconnect

## Troubleshooting

**PostgreSQL connection error:**
- Make sure Docker is running
- Check if PostgreSQL container is up: `docker ps`
- Restart container: `cd quickpoll-backend && docker-compose restart`

**WebSocket connection failed:**
- Make sure backend is running on port 8000
- Check browser console for errors
- Verify CORS settings in backend

**Frontend build errors:**
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next`

## Development

To stop the services:

```bash
# Stop backend (Ctrl+C in backend terminal)

# Stop PostgreSQL
cd quickpoll-backend
docker-compose down

# Stop frontend (Ctrl+C in frontend terminal)
```

To restart:

```bash
# Start PostgreSQL
cd quickpoll-backend
docker-compose up -d

# Start backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Start frontend (new terminal)
cd quickpoll-frontend
npm run dev
```

## License

MIT
