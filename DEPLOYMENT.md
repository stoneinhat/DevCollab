# Deployment Guide

This guide covers deploying DevFlow to various platforms.

## Prerequisites

- Git repository with your code
- Firebase project configured
- Environment variables ready

## Vercel Deployment (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   Add these in Vercel project settings:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL is automatically configured

## Netlify Deployment

### Steps

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   Add all Firebase variables in Site Settings → Environment

3. **Deploy**
   - Connect GitHub repository
   - Trigger deploy

## Firebase Hosting

Deploy alongside your Firebase backend:

### Setup

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `out`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

3. **Update next.config.js**
   ```javascript
   module.exports = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   }
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run

```bash
docker build -t devflow .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \
  # ... other env vars
  devflow
```

## Environment Variables

Required for all deployments:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Firebase authentication providers configured
- [ ] Firestore security rules deployed
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Test authentication flows
- [ ] Test real-time features
- [ ] Monitor Firebase usage
- [ ] Set up error tracking (optional)

## Firestore Security Rules

Deploy your security rules:

```bash
firebase deploy --only firestore:rules
```

## Firebase Authentication Setup

1. Enable providers in Firebase Console:
   - Authentication → Sign-in method
   - Enable Email/Password, Google, GitHub

2. For OAuth providers (Google, GitHub):
   - Configure OAuth consent screen
   - Add authorized domains
   - Add redirect URIs

## Monitoring

### Vercel
- Built-in analytics
- Real-time logs
- Performance monitoring

### Firebase
- Firebase Console → Analytics
- Monitor Firestore usage
- Track authentication

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

### Environment Variables Not Working
- Ensure they're prefixed with `NEXT_PUBLIC_`
- Restart build after adding variables
- Check for typos in variable names

### Firebase Connection Issues
- Verify Firebase credentials
- Check Firestore security rules
- Ensure authentication providers are enabled

### Performance Issues
- Enable Next.js caching
- Optimize images
- Review Firestore query patterns
- Consider implementing pagination

## Scaling

As your app grows:

1. **Database**: 
   - Implement pagination
   - Add indexes for common queries
   - Consider Firebase pricing tiers

2. **Hosting**:
   - Use CDN for static assets
   - Enable image optimization
   - Consider serverless functions for heavy operations

3. **Monitoring**:
   - Set up error tracking (Sentry, etc.)
   - Monitor Firebase quotas
   - Track performance metrics

## Support

For deployment issues:
- Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- Check [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- Open an issue in the repository

---

Happy deploying! 🚀

