# Authentication System Guide

## What Changed

I've added a complete authentication system to QuickPoll:

### Features Added
- ✅ User registration (username, email, password)
- ✅ User login with email and password
- ✅ Secure password hashing with bcrypt
- ✅ Token-based authentication
- ✅ Only logged-in users can create polls
- ✅ Anyone can vote without logging in
- ✅ User info displayed in navbar
- ✅ Logout functionality

## How to Update

### Step 1: Stop your backend server
Press `Ctrl+C` in the terminal running the backend

### Step 2: Run the update script
```bash
./update-auth.sh
```

This will:
- Install bcrypt for password hashing
- Add password_hash column to database
- Update all dependencies

### Step 3: Restart backend
```bash
cd quickpoll-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Step 4: Restart frontend (if needed)
The frontend will automatically pick up changes.

## How It Works

### For Users Creating Polls

1. User clicks "Create Poll"
2. If not logged in, a modal appears asking to login/signup
3. User can:
   - **Sign Up**: Enter username, email, password
   - **Login**: Enter email and password
4. After authentication, user can create polls
5. User info shows in navbar with logout button

### For Users Voting

- No login required!
- Anyone can vote on any poll
- Votes are tracked by browser (localStorage)

## API Endpoints Added

### Authentication
- `POST /auth/register` - Register new user
  ```json
  {
    "username": "john",
    "email": "john@example.com",
    "password": "secret123"
  }
  ```

- `POST /auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "secret123"
  }
  ```

- `GET /auth/me` - Get current user info (requires auth token)

### Protected Endpoints
- `POST /polls/` - Create poll (requires authentication)
- `DELETE /polls/{id}` - Delete poll (requires authentication + ownership)

### Public Endpoints (no auth needed)
- `GET /polls/` - List all polls
- `GET /polls/{id}` - Get poll details
- `POST /votes/` - Submit vote
- `POST /likes/` - Toggle like

## Security Features

- **Password Hashing**: Passwords are hashed with bcrypt (never stored in plain text)
- **Token Authentication**: Bearer token system for API requests
- **Token Expiration**: Tokens expire after 7 days
- **Authorization**: Only poll creators can delete their polls
- **Input Validation**: Email format, password length (min 6 chars), username length (3-50 chars)

## Testing the Auth System

### Test Registration
1. Go to http://localhost:3000
2. Click "Create Poll"
3. Click "Sign up" in the modal
4. Enter:
   - Username: testuser
   - Email: test@example.com
   - Password: test123
5. Click "Sign Up"
6. You should be logged in and see your username in navbar

### Test Login
1. Logout (click logout button)
2. Click "Create Poll" again
3. Click "Login" in the modal
4. Enter your email and password
5. Click "Login"
6. You should be logged in

### Test Poll Creation
1. While logged in, click "Create Poll"
2. Fill in poll details
3. Submit
4. Poll should be created successfully

### Test Voting (No Auth)
1. Open poll in incognito/private window
2. You can vote without logging in
3. Votes update in real-time

## Database Schema Changes

Added to `users` table:
```sql
password_hash VARCHAR(255) -- Stores bcrypt hashed password
```

## Frontend Changes

### New Files
- `lib/auth.ts` - Authentication utilities
- `components/AuthModal.tsx` - Login/signup modal

### Modified Files
- `app/layout.tsx` - Added user info and logout in navbar
- `app/create/page.tsx` - Added auth check before showing form
- `lib/api.ts` - Added auth token to API requests
- `components/CreatePollForm.tsx` - Removed creator_id requirement

## Backend Changes

### New Files
- `app/auth.py` - Authentication logic and token management
- `app/routes/auth.py` - Auth endpoints (register, login, me)
- `migrate_db.py` - Database migration script

### Modified Files
- `app/models.py` - Added password_hash to User model
- `app/schemas.py` - Added auth schemas
- `app/routes/polls.py` - Added auth requirement to create/delete
- `app/main.py` - Added auth router
- `requirements.txt` - Added bcrypt

## Troubleshooting

**"Module not found: bcrypt"**
```bash
cd quickpoll-backend
source venv/bin/activate
pip install bcrypt==4.1.2
```

**"Column password_hash does not exist"**
```bash
cd quickpoll-backend
source venv/bin/activate
python migrate_db.py
```

**"401 Unauthorized" when creating poll**
- Make sure you're logged in
- Check if token is saved in localStorage (F12 → Application → Local Storage)
- Try logging out and logging in again

**Auth modal doesn't appear**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Future Enhancements

Possible additions:
- Email verification
- Password reset
- OAuth (Google, GitHub login)
- User profiles
- Poll ownership display
- User's poll history
- Admin roles
- Rate limiting
- Remember me functionality
- Two-factor authentication

## Security Notes

**Current Implementation:**
- Simple token storage (in-memory on backend)
- Suitable for development and small deployments

**For Production:**
- Use Redis or database for token storage
- Add token refresh mechanism
- Implement rate limiting
- Add HTTPS
- Use environment variables for secrets
- Add CSRF protection
- Implement proper session management

Enjoy your authenticated QuickPoll! 🎉
