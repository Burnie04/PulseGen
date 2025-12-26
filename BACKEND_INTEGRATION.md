# Backend Integration Guide

This guide explains how the MongoDB + Mongoose backend integrates with the React frontend, and provides detailed information about the architecture and workflow.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              React Frontend (Vite)                  │
│  ├─ Authentication (Login/Register)                 │
│  ├─ Video Upload with Progress                      │
│  ├─ Video List with Filters                         │
│  ├─ Video Player with Range Requests                │
│  └─ Admin User Management                           │
└────────────────┬────────────────────────────────────┘
                 │ HTTP/REST API
                 │ (Fetch API)
┌────────────────▼────────────────────────────────────┐
│        Express.js Backend (Node.js)                 │
│  ├─ Authentication Routes (JWT)                     │
│  ├─ Video Upload & Storage                          │
│  ├─ Video Streaming (Range Requests)                │
│  ├─ Video Processing Service                        │
│  └─ User Management (RBAC)                          │
└────────────────┬────────────────────────────────────┘
                 │ Database Protocol
                 │ (MongoDB Driver)
┌────────────────▼────────────────────────────────────┐
│         MongoDB Database                            │
│  ├─ users (User accounts & roles)                   │
│  ├─ videos (Video metadata & status)                │
│  ├─ organizations (Multi-tenancy)                   │
│  └─ video_access (Permission control)               │
└──────────────────────────────────────────────────────┘
```

## Frontend to Backend Communication

### API Client

The frontend uses a centralized API client (`src/lib/api.ts`) for all backend communication:

```typescript
import { apiClient } from './lib/api';

// Register user
const { token, user } = await apiClient.register(email, password, fullName, role);
localStorage.setItem('auth_token', token);

// Upload video
await apiClient.uploadVideo(token, file, title, description);

// Get videos
const videos = await apiClient.getVideos(token);

// Stream video
const streamUrl = apiClient.getStreamUrl(token, videoId);
```

### Authentication Flow

1. **User Registration**
   - Frontend sends email, password, full name, role
   - Backend hashes password with bcryptjs
   - Backend generates JWT token
   - Frontend stores token in localStorage

2. **User Login**
   - Frontend sends email and password
   - Backend verifies password using bcryptjs.compare()
   - Backend generates JWT token
   - Frontend stores token and redirects to dashboard

3. **Authenticated Requests**
   - Frontend includes `Authorization: Bearer {token}` header
   - Backend middleware (authMiddleware) verifies JWT
   - Request proceeds if token is valid
   - 401 Unauthorized if token is missing or expired

### Environment Configuration

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/videostream
JWT_SECRET=your-secret-key-min-32-chars
CORS_ORIGIN=http://localhost:5173
```

## Data Flow: Video Upload

```
User selects file
    ↓
Frontend validates file (type, size)
    ↓
Frontend shows upload progress
    ↓
XMLHttpRequest sends file to /api/videos
    ↓
Backend receives request
    ↓
Middleware checks JWT token
    ↓
Multer processes multipart file
    ↓
Backend saves file to ./uploads/videos/
    ↓
Backend creates video record in MongoDB
    ↓
Backend starts async processing service
    ↓
Backend returns video ID to frontend
    ↓
Frontend redirects to video list
    ↓
Frontend polls /api/videos every 2 seconds
    ↓
Frontend displays processing progress
    ↓
When complete, video appears as "Ready to play"
```

## Data Flow: Video Processing

```
Backend receives processing request
    ↓
Update video status: "processing"
    ↓
Loop: Simulate processing (0-100%)
    ↓
Update progress in MongoDB every 500ms
    ↓
Frontend polling picks up updates
    ↓
Frontend re-renders progress bar
    ↓
Processing complete
    ↓
Calculate sensitivity score (0-1)
    ↓
Determine status: "safe" or "flagged"
    ↓
Update video record in MongoDB
    ↓
Frontend polling detects completion
    ↓
Enable "Play" button
```

## Data Flow: Video Streaming

```
User clicks "Play" button
    ↓
Frontend gets stream URL with token
    ↓
Frontend creates <video> element
    ↓
HTML5 video player requests initial chunk
    ↓
Backend receives GET /api/stream/:id
    ↓
Middleware verifies JWT token
    ↓
Backend reads file from ./uploads/videos/
    ↓
Browser sends Range header (e.g., bytes=0-1023)
    ↓
Backend responds with 206 Partial Content
    ↓
Browser receives chunk and plays
    ↓
User can seek to any position
    ↓
Browser requests new range
    ↓
Backend responds with requested bytes
```

## Directory Structure

```
project/
├── src/                      # React frontend
│   ├── components/
│   │   ├── Auth/            # Login/Register
│   │   ├── Video/           # Upload, List, Player
│   │   ├── Dashboard/       # Main UI
│   │   └── Admin/           # User management
│   ├── contexts/
│   │   └── AuthContext.tsx  # Auth state (JWT)
│   ├── lib/
│   │   └── api.ts           # API client
│   ├── App.tsx              # Main component
│   └── main.tsx             # Entry point
│
├── backend/                  # Express backend
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Video.ts
│   │   │   └── ...
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, errors
│   │   ├── services/        # Business logic
│   │   ├── utils/           # JWT, DB
│   │   └── index.ts         # Server entry
│   ├── uploads/videos/      # Video files
│   ├── package.json         # Dependencies
│   ├── tsconfig.json        # TypeScript config
│   └── .env                 # Environment vars
│
├── .env.local               # Frontend config
├── MONGODB_SETUP.md         # Setup instructions
└── BACKEND_INTEGRATION.md   # This file
```

## API Middleware Chain

### Authentication Middleware
```typescript
// All routes below this middleware require authentication
app.use(authMiddleware);  // Verifies JWT token

app.get('/api/videos', (req, res) => {
  // req.user contains { userId, email, role }
  console.log(req.user.userId);  // Available
});
```

### Role-Based Access Control
```typescript
// Only editors and admins can upload
app.post('/api/videos',
  authMiddleware,
  requireRole('editor', 'admin'),  // Checks role
  upload.single('video'),
  (req, res) => {
    // Executes only if role is editor or admin
  }
);
```

### Error Handling
```typescript
// All errors caught and formatted
try {
  // Operation
} catch (error) {
  // errorHandler middleware catches and formats response
  res.status(500).json({ error: 'Message' });
}
```

## Real-Time Updates (Polling)

Currently, the frontend uses polling every 2 seconds to check video status:

```typescript
const interval = setInterval(loadVideos, 2000);
```

This is a simple approach that works well for small to medium applications. For production, consider upgrading to WebSockets:

### Upgrade to Socket.io (Optional)

Backend already has Socket.io configured:

```typescript
export const io = new SocketIOServer(httpServer, {
  cors: { origin: 'http://localhost:5173' }
});

io.on('connection', (socket) => {
  socket.on('subscribe:video', (videoId) => {
    socket.join(`video:${videoId}`);
  });
});
```

Frontend can subscribe to updates:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');
socket.emit('subscribe:video', videoId);

socket.on(`video:${videoId}:progress`, (data) => {
  setProgress(data.progress);
});
```

## Authentication Security

### Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Plain-text passwords never stored
- Password verification uses constant-time comparison

### JWT Security
- Tokens signed with secret key (minimum 32 characters)
- Token expiration set to 7 days
- Token stored in localStorage (vulnerable to XSS - use httpOnly cookies in production)
- Authorization header required for authenticated routes

### CORS Security
- Only frontend domain can access backend
- Configured in CORS_ORIGIN environment variable
- Prevents unauthorized cross-origin requests

## Error Handling

### Frontend Error Handling
```typescript
try {
  const data = await apiClient.login(email, password);
  setUser(data.user);
} catch (error) {
  setError(error.message);  // Displayed to user
}
```

### Backend Error Handling
```typescript
// Validation errors
const errors = validationResult(req);
if (!errors.isEmpty()) {
  res.status(400).json({ errors: errors.array() });
}

// Database errors
try {
  await user.save();
} catch (error) {
  res.status(500).json({ error: 'Database error' });
}

// Global error handler
app.use(errorHandler);  // Catches all errors
```

## File Upload Security

### Validation
- File type whitelist (video/* only)
- File size limit (500MB default, configurable)
- Multer validates before saving

### Storage
- Files saved to ./uploads/videos/
- Directory created automatically if missing
- Unique filename prevents collisions
- Directory permissions: 755 (readable by server)

## Role-Based Access Control

### User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **viewer** | View videos | Team members (read-only) |
| **editor** | Upload, manage own videos | Content creators |
| **admin** | All editor permissions + user management | Administrators |

### Implementation
```typescript
// Check in auth context
const { isAdmin, isEditor, isViewer } = useAuth();

// Show/hide UI based on role
{isEditor && <UploadButton />}
{isAdmin && <AdminPanel />}
```

## Performance Optimization

### Frontend Optimization
- Lazy loading of components
- Pagination/filtering of video list
- Image compression for thumbnails
- Efficient re-rendering with React hooks

### Backend Optimization
- Database indexes on frequently queried fields
- Connection pooling for MongoDB
- Compression of API responses
- Caching of frequently accessed data

### Video Streaming Optimization
- Range request support (seek to any position)
- Chunked response (doesn't load entire file)
- Content-Type negotiation
- Browser caching via headers

## Testing the Integration

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Configure Frontend
Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Frontend
```bash
npm run dev
```

### 4. Test Workflow
1. Register new user
2. Upload a video
3. Monitor processing progress
4. Play the video
5. Test admin features

### 5. Manual API Testing
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "editor"
  }'

# Get token from response
TOKEN="jwt_token_here"

# Get profile
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Common Integration Issues

### CORS Errors
**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Verify CORS_ORIGIN in backend .env
2. Ensure frontend URL matches CORS_ORIGIN
3. Restart backend after changes

### Token Not Found
**Problem**: `401 Unauthorized - Missing or invalid authorization header`

**Solution**:
1. Verify token is in localStorage
2. Check token is passed in Authorization header
3. Verify Authorization header format: `Bearer token_here`

### File Upload Fails
**Problem**: `Upload failed` when uploading video

**Solution**:
1. Check file size < UPLOAD_MAX_SIZE
2. Verify file is valid video
3. Ensure uploads/videos directory exists
4. Check disk space available

### Video Won't Play
**Problem**: Video shows but won't play

**Solution**:
1. Verify processing is 100% complete
2. Check video file exists in uploads/videos/
3. Try different browser
4. Check console for errors

## Production Deployment

### Before Deploying

1. **Security Hardening**
   - Change JWT_SECRET to strong random string
   - Use httpOnly cookies instead of localStorage
   - Enable HTTPS only
   - Set secure CORS_ORIGIN

2. **Database**
   - Use MongoDB Atlas (managed service)
   - Enable authentication
   - Use connection pooling
   - Enable encryption at rest

3. **File Storage**
   - Use cloud storage (AWS S3, Google Cloud)
   - Enable CDN for video delivery
   - Set up backups

4. **Environment**
   - Set NODE_ENV=production
   - Enable compression
   - Set up monitoring/logging
   - Configure error tracking (Sentry)

### Deployment Options

- **Backend**: Heroku, AWS EC2, DigitalOcean, Railway
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas, AWS DocumentDB, Azure Cosmos DB
- **Storage**: AWS S3, Google Cloud Storage, Cloudinary

## Support & Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Socket.io Docs](https://socket.io/)
- [JWT.io](https://jwt.io/)
