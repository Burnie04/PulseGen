# VideoStream Architecture Documentation

## System Overview

VideoStream is a full-stack video platform that enables users to upload videos, process them for content sensitivity analysis, and stream them securely. The application is built with a modern serverless architecture using Supabase as the backend platform.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth UI      │  │ Video Upload │  │ Video Player │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Video List   │  │ Dashboard    │  │ Admin Panel  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Supabase Client SDK
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Supabase Platform                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                     │   │
│  │  • profiles      • videos                            │   │
│  │  • organizations • video_access                      │   │
│  │  • Row Level Security (RLS) Policies                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Authentication                           │   │
│  │  • Email/Password                                     │   │
│  │  • JWT Tokens                                         │   │
│  │  • Session Management                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Storage                                  │   │
│  │  • videos bucket (private)                            │   │
│  │  • RLS-protected access                               │   │
│  │  • 500MB file size limit                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Edge Functions                           │   │
│  │  • process-video (Content Analysis)                   │   │
│  │  • stream-video (Range Request Streaming)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Realtime                                 │   │
│  │  • Video processing progress updates                  │   │
│  │  • Live status changes                                │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration & Authentication

```
User → Frontend (Register Form)
         ↓
      Supabase Auth (Create User)
         ↓
      Trigger: handle_new_user()
         ↓
      Create Profile Record
         ↓
      Return Session to Frontend
```

### 2. Video Upload Flow

```
User Selects File → Frontend Validation
                        ↓
                    Check File Type & Size
                        ↓
                    Upload to Storage Bucket
                        ↓ (Progress Updates)
                    Create Video Record in DB
                        ↓
                    Call process-video Edge Function
                        ↓
                    Return to Video List
```

### 3. Video Processing Flow

```
process-video Edge Function Triggered
         ↓
Update Status: 'processing'
         ↓
Loop: Update Progress (0-100%)
         ↓ (Realtime Updates to Frontend)
Simulate Content Analysis
         ↓
Calculate Sensitivity Score
         ↓
Update Status: 'completed'
Set Sensitivity: 'safe' or 'flagged'
         ↓
Frontend Receives Update (Realtime)
```

### 4. Video Streaming Flow

```
User Clicks Play → Frontend Requests Video
                        ↓
                   Check Video Status
                        ↓
                   Call stream-video Edge Function
                        ↓
                   Verify User Authorization
                        ↓
                   Download from Storage
                        ↓
                   Parse Range Header
                        ↓
                   Return Chunk (206 Partial Content)
                        ↓
                   Browser Plays Video
```

## Database Schema

### Tables

#### profiles
Extends the built-in `auth.users` table with additional user information.

```sql
- id (uuid, PK, FK to auth.users)
- email (text)
- full_name (text)
- role (enum: viewer, editor, admin)
- organization_id (uuid, FK to organizations)
- avatar_url (text)
- timestamps
```

#### organizations
Supports multi-tenant architecture.

```sql
- id (uuid, PK)
- name (text)
- slug (text, unique)
- timestamps
```

#### videos
Stores video metadata and processing information.

```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- organization_id (uuid, FK to organizations)
- title (text)
- description (text)
- file_name (text)
- file_size (bigint)
- duration (integer)
- mime_type (text)
- storage_path (text)
- thumbnail_path (text)
- processing_status (enum: pending, processing, completed, failed)
- processing_progress (integer, 0-100)
- sensitivity_status (enum: pending, safe, flagged)
- sensitivity_score (numeric, 0-1)
- timestamps
```

#### video_access
Granular access control for videos.

```sql
- id (uuid, PK)
- video_id (uuid, FK to videos)
- user_id (uuid, FK to auth.users)
- access_type (enum: view, edit, admin)
- granted_by (uuid, FK to auth.users)
- granted_at (timestamp)
```

## Security Model

### Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:

1. **Organization Isolation**: Users can only access data from their organization
2. **Role-Based Access**: Actions restricted based on user role
3. **Ownership Checks**: Users can only modify their own content
4. **Admin Override**: Admins have elevated permissions within their organization

### Storage Security

- All buckets are private by default
- Access controlled through RLS policies
- File paths include video ID for organization
- JWT authentication required for all operations

### Authentication Security

- Password requirements enforced
- JWT tokens with automatic refresh
- Session management handled by Supabase
- Secure token storage in browser

## Component Architecture

### Frontend Components

```
App (Root)
├── AuthProvider (Context)
│   └── Auth State Management
│
├── AuthPage (Public)
│   ├── LoginForm
│   └── RegisterForm
│
└── Dashboard (Protected)
    ├── Header
    │   ├── Logo
    │   ├── User Info
    │   └── Sign Out
    │
    ├── Navigation Tabs
    │   ├── My Videos
    │   ├── Upload (Editor+)
    │   └── Admin (Admin only)
    │
    └── Content Area
        ├── VideoList
        │   ├── Filter Bar
        │   ├── Video Cards
        │   └── Status Indicators
        │
        ├── VideoUpload (Editor+)
        │   ├── File Selector
        │   ├── Metadata Form
        │   └── Progress Bar
        │
        ├── VideoPlayer (Modal)
        │   ├── Video Element
        │   ├── Metadata Display
        │   └── Content Warnings
        │
        └── AdminPanel (Admin only)
            ├── User List
            ├── Role Management
            └── Statistics
```

## Edge Functions

### process-video

**Purpose**: Simulates video processing and performs content sensitivity analysis.

**Flow**:
1. Receive video ID in request body
2. Validate video exists
3. Update status to 'processing'
4. Loop through progress updates (0-100%)
5. Calculate random sensitivity score
6. Determine safe/flagged status
7. Update video record with results

**Technologies**: Deno runtime, Supabase client

### stream-video

**Purpose**: Streams video content with HTTP range request support.

**Flow**:
1. Receive video ID from query parameter
2. Verify user authentication
3. Check user has access to video
4. Download video from storage
5. Parse Range header (if present)
6. Return appropriate chunk with 206 status
7. Set proper CORS and Content-Type headers

**Technologies**: Deno runtime, Supabase client, Storage API

## Real-Time Updates

### Supabase Realtime

The application uses Supabase Realtime to provide live updates:

**Video List Component**:
```javascript
supabase
  .channel('videos_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'videos'
  }, () => {
    // Reload videos when changes occur
    loadVideos();
  })
  .subscribe();
```

**Benefits**:
- No polling required
- Instant updates across all users
- Low latency
- Efficient bandwidth usage

## State Management

### AuthContext

Manages authentication state across the application:

```javascript
{
  user: User | null,
  session: Session | null,
  profile: Profile | null,
  loading: boolean,
  signUp: Function,
  signIn: Function,
  signOut: Function,
  isAdmin: boolean,
  isEditor: boolean,
  isViewer: boolean
}
```

**Features**:
- Automatic session restoration
- Profile loading on auth change
- Role-based permission helpers
- Loading state management

## API Integration

### Supabase Client Configuration

```javascript
const supabase = createClient(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);
```

## Performance Considerations

### Video Upload
- Progress tracking prevents user confusion
- Large file support (up to 500MB)
- Client-side validation reduces failed uploads

### Video Streaming
- HTTP range requests enable seeking
- Partial content delivery reduces bandwidth
- Browser-native video player optimizations

### Real-Time Updates
- Throttled to 10 events per second
- Automatic reconnection on disconnect
- Efficient change detection

### Database Queries
- Indexed foreign keys
- Optimized RLS policies
- Selective column fetching

## Scalability

### Horizontal Scaling
- Serverless Edge Functions auto-scale
- Supabase manages database connections
- Storage distributed across CDN

### Multi-Tenancy
- Organization-based data isolation
- Shared infrastructure
- Per-organization access control

### Future Optimizations
- Video transcoding for multiple qualities
- CDN integration for global distribution
- Caching layer for frequently accessed content
- Background job queue for processing

## Error Handling

### Frontend
- User-friendly error messages
- Loading states for async operations
- Fallback UI for failed operations
- Console logging for debugging

### Backend
- Try-catch blocks in Edge Functions
- Database constraint validation
- Storage operation error handling
- Authentication error responses

## Deployment Architecture

### Production Setup

```
Frontend (Vite Build)
├── Static Assets → CDN/Hosting
└── Environment Variables (Build-time)

Backend (Supabase)
├── Database → Managed PostgreSQL
├── Storage → Object Storage
├── Edge Functions → Deno Deploy
└── Authentication → Managed Service
```

### Environment Configuration

**Development**:
- Local Vite dev server
- Supabase cloud services
- Hot module replacement

**Production**:
- Static site hosting (Vercel, Netlify, etc.)
- Supabase production project
- Optimized builds

## Monitoring & Observability

### Available Metrics
- Supabase Dashboard
  - Database performance
  - Storage usage
  - Edge Function logs
  - Authentication metrics

### Application Logging
- Frontend: Browser console
- Backend: Edge Function logs
- Database: Query performance logs

## Design Decisions

### Why Supabase?
- Built-in authentication
- Real-time capabilities
- Automatic API generation
- Edge Functions for custom logic
- Generous free tier

### Why React?
- Component reusability
- Strong ecosystem
- TypeScript support
- Excellent developer experience

### Why Vite?
- Fast development server
- Optimized production builds
- Modern tooling
- Great TypeScript support

### Why Row Level Security?
- Database-level security
- Cannot be bypassed
- Centralized access control
- Scalable multi-tenancy

## Testing Strategy

### Unit Testing
- Component logic
- Utility functions
- State management

### Integration Testing
- Authentication flows
- Video upload process
- API interactions

### E2E Testing
- Complete user workflows
- Cross-browser compatibility
- Mobile responsiveness

## Maintenance

### Database Migrations
- Version-controlled SQL files
- Descriptive change logs
- Rollback procedures

### Schema Updates
- Non-breaking changes preferred
- Careful RLS policy updates
- Migration testing

### Dependency Updates
- Regular security updates
- Version pinning for stability
- Changelog review

## Conclusion

VideoStream demonstrates a modern, scalable architecture for video management platforms. The use of Supabase provides a robust backend infrastructure while maintaining simplicity and developer productivity. The application successfully implements all required features including multi-tenancy, RBAC, real-time updates, and efficient video streaming.
