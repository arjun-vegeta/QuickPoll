# QuickPoll

A real-time polling platform with live vote updates, built with Next.js and FastAPI.

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL

### Backend Setup

1. **Install PostgreSQL and create database**

```bash
createdb quickpoll
```

2. **Setup backend**

```bash
cd quickpoll-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure environment**

```bash
# Create .env file
DATABASE_URL=postgresql://quickpoll:quickpoll_dev@localhost:5432/quickpoll
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000
```

4. **Initialize database**

```bash
python create_tables.py
python add_category_migration.py
python add_comments_table.py
```

5. **Run backend**

```bash
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**

```bash
cd quickpoll-frontend
npm install
```

2. **Configure environment**

```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

3. **Run frontend**

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy, WebSockets
- **Database**: PostgreSQL
- **Deployment**: Netlify (Frontend), Render (Backend)

## Features

- Real-time vote updates via WebSockets
- Live viewer count
- User authentication (JWT)
- Comments and likes
- Poll categories and filtering
- Responsive design

---

Built by Arjun
