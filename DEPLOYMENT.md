# VideoStream Deployment Guide

This guide provides step-by-step instructions for deploying the VideoStream application to production.

## Prerequisites

- A Supabase account
- Node.js 18+ installed locally
- Git repository (GitHub, GitLab, etc.)
- Deployment platform account (Vercel, Netlify, or similar)

## Part 1: Supabase Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: VideoStream (or your preferred name)
   - Database Password: Generate a secure password
   - Region: Choose closest to your users
4. Wait for project to be created (2-3 minutes)

### 2. Configure Database

The database migrations have already been created. The schema includes:
- User profiles with roles
- Organizations for multi-tenancy
- Videos table with processing status
- Video access control
- Row Level Security policies

All migrations are automatically applied when you set up the project.

### 3. Get API Credentials

1. Go to Project Settings → API
2. Copy the following:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **Anon/Public Key** (starts with "eyJ...")

Save these for later - you'll need them for environment variables.

### 4. Configure Storage

The storage bucket is already configured via migration. Verify it:

1. Go to Storage in Supabase Dashboard
2. Confirm "videos" bucket exists
3. Verify policies are in place

### 5. Enable Realtime

1. Go to Database → Replication
2. Ensure the "videos" table has replication enabled
3. This allows real-time updates in the frontend

### 6. Verify Edge Functions

Two Edge Functions should be deployed:
- `process-video` - Handles video processing
- `stream-video` - Handles video streaming

These are already deployed when you set up the project.

## Part 2: Frontend Deployment

We'll use Vercel as an example, but these steps work similarly for Netlify or other platforms.

### Option A: Vercel Deployment

#### 1. Prepare Your Repository

Ensure your code is pushed to GitHub, GitLab, or Bitbucket.

#### 2. Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect it's a Vite project

#### 3. Configure Build Settings

Vercel should auto-configure these, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 4. Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Replace with your actual Supabase credentials.

#### 5. Deploy

1. Click "Deploy"
2. Wait for build to complete (1-2 minutes)
3. Your app will be live at `your-project.vercel.app`

#### 6. Configure Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

### Option B: Netlify Deployment

#### 1. Connect Repository

1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your repository

#### 2. Configure Build

- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### 3. Environment Variables

In Site Settings → Build & deploy → Environment:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

#### 4. Deploy

Click "Deploy site" and wait for completion.

### Option C: Manual Deployment (Any Static Host)

#### 1. Build Locally

```bash
npm install
npm run build
```

This creates a `dist` folder with static files.

#### 2. Set Environment Variables

Before building, create a `.env` file:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Then rebuild:

```bash
npm run build
```

#### 3. Upload dist Folder

Upload the `dist` folder contents to your hosting provider:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- GitHub Pages
- Any static file host

#### 4. Configure Routing

For single-page apps, configure your host to:
- Serve `index.html` for all routes
- Handle 404s by serving `index.html`

Example for Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Part 3: Post-Deployment Configuration

### 1. Update Supabase URL Whitelist (Optional)

For added security, whitelist your deployment domain:

1. Go to Authentication → URL Configuration
2. Add your production URL to Site URL
3. Add to Redirect URLs if needed

### 2. Test the Deployment

#### Create Test User

1. Visit your deployed URL
2. Click "Sign up"
3. Create an account with:
   - Full name
   - Email
   - Password
   - Role: Admin (for first user)

#### Upload Test Video

1. Sign in with your test account
2. Go to Upload tab
3. Select a small test video
4. Fill in title and description
5. Click Upload
6. Verify processing starts

#### Verify Real-Time Updates

1. Watch the processing progress bar
2. Confirm status changes from "Processing" to "Completed"
3. Verify sensitivity status is assigned

#### Test Video Playback

1. Click "Play" on completed video
2. Verify video loads and plays
3. Test seeking in the video
4. Check content warning for flagged videos

#### Test Admin Panel

1. Go to Admin tab
2. Verify you can see user list
3. Try changing a user's role
4. Verify changes are reflected

### 3. Configure Email (Optional)

By default, Supabase sends confirmation emails. To customize:

1. Go to Authentication → Email Templates
2. Customize templates for:
   - Confirmation
   - Password reset
   - Magic link (if enabled)

For production, configure SMTP:

1. Go to Project Settings → Auth
2. Enable "Enable Custom SMTP"
3. Add your SMTP credentials

### 4. Set Up Monitoring

#### Enable Supabase Monitoring

1. Go to Reports in Supabase Dashboard
2. Monitor:
   - API requests
   - Database performance
   - Storage usage
   - Edge Function logs

#### Frontend Monitoring (Optional)

Consider adding:
- Sentry for error tracking
- Google Analytics for usage
- LogRocket for session replay
- Hotjar for user behavior

## Part 4: Security Checklist

Before going live, verify:

- [ ] Environment variables are secure
- [ ] Database RLS policies are enabled
- [ ] Storage buckets are private
- [ ] Edge Functions have JWT verification
- [ ] CORS headers are properly configured
- [ ] SQL injection prevention is in place
- [ ] XSS protection is active
- [ ] File upload limits are enforced
- [ ] User roles are properly restricted
- [ ] Sensitive data is not logged

## Part 5: Performance Optimization

### Enable Caching

#### Vercel
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Netlify
Create `netlify.toml`:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Database Optimization

1. Monitor slow queries in Supabase
2. Add indexes if needed
3. Optimize RLS policies
4. Use connection pooling

### Storage Optimization

1. Consider adding CDN
2. Enable compression
3. Implement lazy loading
4. Add video thumbnails

## Part 6: Backup & Recovery

### Database Backups

Supabase automatically backs up your database. To access:

1. Go to Database → Backups
2. Daily backups are kept for 7 days (free tier)
3. Upgrade for longer retention

### Manual Backup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Backup database
supabase db dump -f backup.sql
```

### Storage Backup

Use Supabase API to download all files:

```javascript
const { data: files } = await supabase
  .storage
  .from('videos')
  .list();

// Download each file
for (const file of files) {
  const { data } = await supabase
    .storage
    .from('videos')
    .download(file.name);
  // Save to local storage
}
```

## Part 7: Scaling Considerations

### When to Upgrade Supabase Plan

Free tier limits:
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth per month
- 500K Edge Function invocations

Upgrade when:
- Storage > 400 MB
- Users > 50
- Videos > 100
- High concurrent usage

### Database Scaling

1. Enable connection pooling
2. Use read replicas
3. Implement caching layer
4. Optimize queries

### Storage Scaling

1. Use CDN for video delivery
2. Implement video transcoding
3. Add compression
4. Consider external storage (S3)

### Edge Function Scaling

Edge Functions auto-scale, but consider:
- Optimize processing time
- Add request queuing
- Implement rate limiting
- Use background jobs

## Part 8: Troubleshooting

### Build Fails

**Problem**: Vite build fails with "VITE_SUPABASE_URL is not defined"

**Solution**: Ensure environment variables are set in your deployment platform.

### Videos Don't Upload

**Problem**: Upload fails with 403 error

**Solution**:
1. Check user has Editor/Admin role
2. Verify storage policies in Supabase
3. Check file size limits
4. Verify CORS configuration

### Videos Don't Play

**Problem**: Video player shows error

**Solution**:
1. Check video processing completed
2. Verify stream-video Edge Function is deployed
3. Check browser console for errors
4. Test Edge Function directly

### Real-Time Updates Don't Work

**Problem**: Processing progress doesn't update

**Solution**:
1. Verify Realtime is enabled in Supabase
2. Check table replication settings
3. Look for WebSocket connection errors
4. Test connection in browser console

### Authentication Issues

**Problem**: Users can't sign in

**Solution**:
1. Check email confirmation settings
2. Verify redirect URLs in Supabase
3. Check browser local storage
4. Clear cookies and try again

## Part 9: Maintenance

### Regular Tasks

**Weekly**:
- Check error logs
- Monitor storage usage
- Review user reports
- Check performance metrics

**Monthly**:
- Update dependencies
- Review security alerts
- Backup database manually
- Test all features

**Quarterly**:
- Review and optimize RLS policies
- Audit user roles
- Check compliance requirements
- Plan feature updates

### Updates

To update the application:

1. Make changes locally
2. Test thoroughly
3. Commit to Git
4. Push to main branch
5. Deployment platform auto-deploys
6. Monitor for issues

### Rollback

If deployment has issues:

**Vercel/Netlify**:
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

**Manual**:
1. Revert Git commit
2. Push to main
3. Wait for rebuild

## Part 10: Going Live Checklist

Before announcing your application:

- [ ] All features tested end-to-end
- [ ] Security checklist completed
- [ ] Performance optimized
- [ ] Error tracking configured
- [ ] Monitoring set up
- [ ] Backups verified
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Terms of service added
- [ ] Privacy policy added
- [ ] Contact information available
- [ ] Demo video created
- [ ] Documentation updated
- [ ] Support system in place

## Support Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)

### Community
- Supabase Discord
- Stack Overflow
- GitHub Issues

### Professional Help
- Supabase Support (paid plans)
- Freelance developers
- Development agencies

## Conclusion

Following this guide will help you successfully deploy VideoStream to production. Remember to:
- Test thoroughly before going live
- Monitor your application regularly
- Keep dependencies updated
- Back up your data
- Scale proactively

Good luck with your deployment!
