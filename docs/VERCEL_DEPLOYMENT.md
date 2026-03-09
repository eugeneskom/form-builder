# Vercel Deployment Guide

## 📋 Checklist

- [ ] Choose and set up a cloud database
- [ ] Update Prisma schema to use the new database
- [ ] Create Vercel project
- [ ] Set environment variables
- [ ] Deploy!

## 🗄️ Database Options

Since SQLite doesn't work on Vercel's ephemeral filesystem, choose one:

### ✅ **Option 1: Vercel Postgres (Recommended)**
- Integrated with Vercel dashboard
- Easy setup, automatic backups
- Good for hobby/small projects

**Setup:**
1. Go to Vercel Dashboard → Storage → Create Database → Postgres
2. Copy the connection string
3. Update [prisma/schema.prisma](../prisma/schema.prisma):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Run migrations:
```bash
npx prisma migrate deploy
```

### ✅ **Option 2: Neon (Free tier available)**
- Excellent free tier (0.5 GB)
- Serverless PostgreSQL
- https://neon.tech

**Setup:**
1. Create account at neon.tech
2. Create a project and database
3. Copy connection string
4. Update schema as above

### ✅ **Option 3: Supabase**
- PostgreSQL + Auth + Storage
- Good free tier (500 MB)
- https://supabase.com

**Setup:**
1. Create project on supabase.com
2. Copy PostgreSQL connection string
3. Update schema as above

### ✅ **Option 4: PlanetScale (MySQL)**
- MySQL serverless
- Free tier available
- https://planetscale.com

**Setup:**
1. Create account and database
2. Get connection string
3. Update schema:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 🚀 Deployment Steps

### 1. Update `.env.example`

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Vercel runs migrations automatically
# No need for manual migration
```

### 2. Connect to GitHub

1. Push your code to GitHub
2. Go to https://vercel.com/import
3. Select your repository
4. Click "Import"

### 3. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=<your-database-url>
SESSION_SECRET=<long-random-string>
GITHUB_CLIENT_ID=<your-github-app-id>
GITHUB_CLIENT_SECRET=<your-github-app-secret>
OPENAI_API_KEY=<optional-your-openai-key>
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configure Build Settings

The `vercel.json` already configures:
- **Build command**: `npm run build && npx prisma generate`
- **Output directory**: `build`
- **Dev command**: `npm run dev`

### 5. Deploy

Option A: Automatic (recommended)
- Every push to main branch triggers deployment

Option B: Manual
```bash
npm i -g vercel
vercel
```

## 📝 Additional Configuration

### Prisma on Serverless

The current `app/db.server.ts` is already optimized for serverless. It:
- Reuses connections in development
- Creates new connection per request in production
- Works with connection pooling

### GitHub OAuth on Vercel

Make sure your GitHub app redirect URL is updated:
- Local: `http://localhost:5173/auth/github/callback`
- Production: `https://your-vercel-domain.vercel.app/auth/github/callback`

Update in GitHub Settings → Developer applications → Your app

## ⚠️ Important Notes

1. **Database migrations**: Run locally first
   ```bash
   npx prisma migrate dev
   ```

2. **Prisma generation**: Happens automatically in Vercel build

3. **SQLite fallback**: If you want SQLite for testing, use a string database URL parameter or create `.env.local` for local development

4. **Session secret**: Must be at least 32 characters for security

## 🔗 Helpful Links

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Remix on Vercel](https://remix.run/docs/en/main/guides/deployment/vercel)

## 🆘 Troubleshooting

**Build fails with "DATABASE_URL not found"**
- Ensure DATABASE_URL is set in Environment Variables

**Connection errors after deploy**
- Check database credentials match production
- Ensure database IP allowlist includes Vercel IPs

**Static assets 404**
- Check `build` folder exists in output
- Verify `vite.config.ts` is correct

**Prisma client version mismatch**
- Run: `npx prisma generate` before deploying
