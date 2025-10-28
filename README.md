# QuickPoll - Real-time Polling Platform

A modern, real-time polling platform built with FastAPI, Next.js, PostgreSQL, and WebSockets. Create polls, vote in real-time, and see live results with instant updates across all connected clients.

## ✨ Features

- 🔄 **Real-time Updates** - Instant vote and like updates via WebSockets
- 👥 **Live Viewer Count** - See how many people are viewing each poll
- 💬 **Comments System** - Discuss polls with authenticated or anonymous comments
- 🔐 **User Authentication** - Secure registration and login with bcrypt
- 📊 **Animated Charts** - Beautiful, responsive charts with Recharts
- 🎨 **Modern UI** - Dark theme with shadcn/ui components
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- 🔄 **Vote Changing** - Users can change their vote anytime
- 🔌 **Auto-Reconnect** - WebSocket connections automatically recover
- 🏷️ **Categories** - Organize polls by category with related suggestions

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs) directory:

- **[Getting Started](./docs/README.md)** - Quick overview and links
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and technical architecture
- **[API Reference](./docs/API.md)** - Complete API endpoint documentation
- **[Frontend Guide](./docs/FRONTEND.md)** - Frontend components and structure
- **[Backend Guide](./docs/BACKEND.md)** - Backend services and implementation
- **[WebSocket Protocol](./docs/WEBSOCKET.md)** - Real-time communication protocol
- **[Database Schema](./docs/DATABASE.md)** - Database models and relationships
- **[Authentication](./docs/AUTH.md)** - Authentication and security
- **[Development Guide](./docs/DEVELOPMENT.md)** - Local development setup
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Testing Guide](./docs/TESTING.md)** - Testing strategies and examples

## 🚀 Tech Stack

### Backend
- **Framework:** FastAPI 0.109.0
- **Database:** PostgreSQL 16
- **ORM:** SQLAlchemy 2.0.25
- **WebSockets:** Native FastAPI support
- **Authentication:** bcrypt 4.1.2

### Frontend
- **Framework:** Next.js 14.1.0
- **Language:** TypeScript 5.3.3
- **UI Library:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS 3.3.0
- **Charts:** Recharts 2.15.4
- **HTTP Client:** Axios 1.6.5

## 📋 Prerequisites

- Node.js v23.6.1+
- Python 3.11.8+
- npm 10.9.2+
- Docker Desktop 

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

## 🎯 Quick Start

### Automated Setup (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/quickpoll.git
cd quickpoll

# Run setup script
chmod +x setup.sh
./setup.sh

# Start backend (terminal 1)
./start-backend.sh

# Start frontend (terminal 2)
./start-frontend.sh
```

Visit **http://localhost:3000** 🎉

### Manual Setup

See the [Development Guide](./docs/DEVELOPMENT.md) for detailed manual setup instructions.

## 📁 Project Structure

```
quickpoll/
├── quickpoll-backend/          # FastAPI backend
│   ├── app/
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── main.py            # App entry point
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── websocket_manager.py
│   ├── docker-compose.yml     # PostgreSQL container
│   └── requirements.txt
├── quickpoll-frontend/         # Next.js frontend
│   ├── app/                   # Pages (App Router)
│   ├── components/            # React components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities
│   └── types/                 # TypeScript types
├── docs/                      # Documentation
├── setup.sh                   # Setup script
├── start-backend.sh           # Backend start script
└── start-frontend.sh          # Frontend start script
```

## 🔌 API Overview

### REST Endpoints
- `GET /polls/` - List all polls
- `GET /polls/{id}` - Get poll by ID
- `POST /polls/` - Create new poll (auth required)
- `POST /votes/` - Submit/change vote
- `POST /likes/` - Toggle like
- `POST /comments/` - Add comment (auth required)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### WebSocket
- `WS /ws/poll/{id}` - Real-time updates for a specific poll

See the [API Reference](./docs/API.md) for complete documentation.

## 🧪 Testing

### Quick Manual Test

1. Open http://localhost:3000
2. Create a poll with 3+ options
3. Open the poll in 3 different browser tabs
4. Vote from tab 1 → verify instant update in tabs 2 & 3
5. Change vote from tab 2 → verify update everywhere
6. Click like from tab 3 → verify counter updates
7. Close tab 1 → verify viewer count decreases
8. Refresh page → verify data persists

See the [Testing Guide](./docs/TESTING.md) for comprehensive testing strategies.

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

## 🛠️ Development

### Common Commands

```bash
# Stop services
# Backend: Ctrl+C in terminal
# Frontend: Ctrl+C in terminal
# PostgreSQL: cd quickpoll-backend && docker-compose down

# Restart services
./start-backend.sh    # Terminal 1
./start-frontend.sh   # Terminal 2

# View logs
docker logs quickpoll-backend-postgres-1

# Access database
docker exec -it quickpoll-backend-postgres-1 psql -U quickpoll
```

See the [Development Guide](./docs/DEVELOPMENT.md) for detailed development workflows.

## 🚢 Deployment

For production deployment instructions, see the [Deployment Guide](./docs/DEPLOYMENT.md).

Quick overview:
- Deploy backend with Gunicorn + Uvicorn workers
- Deploy frontend with Next.js production build
- Use nginx as reverse proxy
- Configure SSL with Let's Encrypt
- Set up PostgreSQL with backups

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [PostgreSQL](https://www.postgresql.org/) - Powerful open-source database

## 📞 Support

- 📖 [Documentation](./docs/README.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/quickpoll/issues)
- 💬 [Discussions](https://github.com/yourusername/quickpoll/discussions)

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
