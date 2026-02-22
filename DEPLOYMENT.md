# Flowbites Marketplace — Production Deployment

Stack: **Vercel** (Next.js frontend) + **Railway** (Express API) + **MongoDB Atlas** (database)

---

## Step 1: MongoDB Atlas (Free Tier)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new **Shared Cluster** (free M0 tier is fine to start)
   - Choose a region close to your users (e.g., AWS us-east-1)
3. Under **Database Access**, create a database user:
   - Username: `flowbites`
   - Password: generate a strong password (save it!)
   - Role: **Read and write to any database**
4. Under **Network Access**, add an IP address:
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) — required for Railway
5. Click **Connect** on your cluster → **Connect your application**
6. Copy the connection string. It looks like:
   ```
   mongodb+srv://flowbites:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password and add the database name:
   ```
   mongodb+srv://flowbites:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flowbites-marketplace?retryWrites=true&w=majority
   ```

**Save this connection string** — you'll need it for Railway.

---

## Step 2: Railway (Express API Backend)

### 2a. Push code to GitHub

If your project isn't on GitHub yet:

```bash
cd /Users/techplatoinc/Desktop/flowbites-marketplace-main
git init
git add .
git commit -m "Initial commit"
gh repo create flowbites-marketplace --private --source=. --push
```

### 2b. Create Railway project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `flowbites-marketplace` repository
4. Railway will auto-detect the project. Click **Settings** on the deployed service:
   - **Root Directory**: set to `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2c. Set environment variables

In the Railway service dashboard → **Variables** tab, add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://flowbites:PASSWORD@cluster0.xxxxx.mongodb.net/flowbites-marketplace?retryWrites=true&w=majority` |
| `JWT_ACCESS_SECRET` | Generate with: `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | Generate with: `openssl rand -hex 64` (different from above!) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://yourdomain.com` (your custom domain) |
| `SITE_URL` | `https://yourdomain.com` |
| `RATE_LIMIT_MAX_REQUESTS` | `200` |

**Optional (enable when ready):**

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook dashboard |
| `STRIPE_PLATFORM_FEE_PERCENT` | `20` |
| `RESEND_API_KEY` | Your Resend API key (`re_...`) |
| `FROM_EMAIL` | `noreply@yourdomain.com` |
| `FROM_NAME` | `Flowbites` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

> **Note**: Without `STRIPE_SECRET_KEY`, payments run in demo mode (auto-fulfilled).
> Without `RESEND_API_KEY`, emails are logged to console.
> Without `CLOUDINARY_*`, file uploads use local storage (ephemeral on Railway — set up Cloudinary for production!).

### 2d. Get Railway public URL

1. In Railway → your service → **Settings** → **Networking**
2. Click **Generate Domain** to get a public URL like `flowbites-api-production.up.railway.app`
3. **Save this URL** — you'll need it for Vercel

### 2e. Seed the database (optional)

If you want demo data, you can run the seed script locally pointing to your Atlas database:

```bash
cd server
MONGODB_URI="mongodb+srv://flowbites:PASSWORD@cluster0.xxxxx.mongodb.net/flowbites-marketplace?retryWrites=true&w=majority" \
JWT_ACCESS_SECRET=temp JWT_REFRESH_SECRET=temp \
npm run seed:all
```

### 2f. Verify

```bash
curl https://YOUR-RAILWAY-URL.railway.app/health
# Should return: {"success":true,"message":"Flowbites Marketplace API is running"}
```

---

## Step 3: Vercel (Next.js Frontend)

### 3a. Create Vercel project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project** → Import your `flowbites-marketplace` repo
3. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `next-client`
   - **Build Command**: `npm run build`
   - **Output Directory**: leave default (`.next`)

### 3b. Set environment variables

In Vercel → Project Settings → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `/api` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://YOUR-RAILWAY-URL.railway.app` |
| `API_INTERNAL_URL` | `https://YOUR-RAILWAY-URL.railway.app/api` |
| `NEXT_PUBLIC_UPLOADS_URL` | `/uploads` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

**If using Stripe:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |

**If using Cloudinary:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your cloud name |

### 3c. Deploy

Click **Deploy**. Vercel will build and deploy your Next.js app.

### 3d. Verify

Visit `https://your-vercel-url.vercel.app` — you should see the homepage.

---

## Step 4: Custom Domain

### 4a. Add domain to Vercel

1. In Vercel → Project Settings → **Domains**
2. Add your domain (e.g., `flowbites.com` and `www.flowbites.com`)
3. Vercel will show you DNS records to add

### 4b. Update DNS records

In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

**For apex domain (flowbites.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP)

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### 4c. Update Railway environment variables

After your domain is live, update these on Railway:

```
CLIENT_URL = https://yourdomain.com
SITE_URL = https://yourdomain.com
```

### 4d. Update Vercel environment variables

```
NEXT_PUBLIC_SITE_URL = https://yourdomain.com
```

Then redeploy both services.

---

## Step 5: Stripe Webhooks (when ready for payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → **Webhooks**
2. Click **Add endpoint**
3. Set the URL to: `https://YOUR-RAILWAY-URL.railway.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing Secret** and add it to Railway as `STRIPE_WEBHOOK_SECRET`

> **Important**: The webhook URL must point directly to Railway (not through Vercel rewrites), because Stripe sends webhooks server-to-server.

---

## Architecture Overview

```
Browser → yourdomain.com (Vercel)
              |
              |-- Static pages (SSR/SSG by Next.js)
              |-- /api/* → rewrites to Railway backend
              |-- /uploads/* → rewrites to Railway backend
              |
              └── Railway (Express API)
                    |
                    └── MongoDB Atlas
```

- **All browser requests** go to your custom domain on Vercel
- **API calls** (`/api/*`) are transparently proxied by Vercel to Railway
- **File uploads** (`/uploads/*`) are proxied the same way
- **SSR data fetching** uses `API_INTERNAL_URL` to call Railway directly
- **Cookies** work seamlessly because everything goes through the same domain

---

## Post-Deployment Checklist

- [ ] Health check passes: `curl https://RAILWAY-URL/health`
- [ ] Homepage loads at `https://yourdomain.com`
- [ ] Blog loads at `https://yourdomain.com/blog`
- [ ] Registration/login works
- [ ] Template browsing works
- [ ] Admin login works (admin@flowbites.com)
- [ ] **Change admin password immediately!**
- [ ] Set up Cloudinary for persistent file storage
- [ ] Set up Stripe for real payments
- [ ] Set up Resend for real emails
- [ ] Set up a custom email domain in Resend for `noreply@yourdomain.com`

---

## Useful Commands

```bash
# Check Railway API health
curl https://YOUR-RAILWAY-URL.railway.app/health

# Check API through Vercel proxy
curl https://yourdomain.com/api/templates?limit=1

# View Railway logs
railway logs

# Redeploy Railway
railway up

# Redeploy Vercel
vercel --prod
```

---

## Troubleshooting

### "CSRF validation failed"
Ensure `CLIENT_URL` on Railway matches your exact domain (including `https://`).

### "CORS error" in browser console
Ensure `CLIENT_URL` on Railway is set to `https://yourdomain.com` (no trailing slash).

### API calls return 404
Ensure `NEXT_PUBLIC_API_BASE_URL` on Vercel points to your Railway URL (no `/api` suffix).

### Images not loading
Ensure Cloudinary is configured, or that `NEXT_PUBLIC_UPLOADS_URL` is set to `/uploads`.

### Database connection fails
Ensure MongoDB Atlas Network Access allows `0.0.0.0/0` (for Railway's dynamic IPs).
