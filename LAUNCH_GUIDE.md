# 🚀 Flowbites Marketplace - Launch Guide

Complete guide to launch your marketplace with live payments, cloud storage, and admin management.

---

## 📋 Pre-Launch Checklist

### 1. Admin Accounts Setup

Your platform now has **three levels of access**:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Super Admin** | superadmin@flowbites.com | superadmin2024! | Full platform control |
| **Flowbites Admin** | admin@flowbites.com | flowbites2024! | Manage templates, creators, orders |
| **Flowbites Creator** | flowbites@flowbites.com | flowbites123 | Upload/manage Flowbites templates |

**Admin Portal:** http://localhost:3000/admin/login

---

### 2. Stripe Live Configuration

#### Step 1: Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up and complete verification
3. Switch to **Live Mode** (toggle in top right)

#### Step 2: Get API Keys
1. Go to Developers → API Keys
2. Copy **Secret Key** (starts with `sk_live_`)
3. Go to Developers → Webhooks
4. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Select events: `payment_intent.succeeded`, `checkout.session.completed`
6. Copy **Webhook Signing Secret** (starts with `whsec_`)

#### Step 3: Configure Environment
```bash
# Edit server/.env
STRIPE_SECRET_KEY=sk_live_your_actual_live_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PLATFORM_FEE_PERCENT=20
```

#### Step 4: Stripe Connect (For Paying Creators)
1. Go to Settings → Connect
2. Enable Stripe Connect
3. Copy **Client ID** (starts with `ca_`)
4. Add to .env: `STRIPE_CONNECT_CLIENT_ID=ca_your_client_id`

---

### 3. Cloudinary Cloud Storage

Your platform already has Cloudinary integration! Just configure it:

#### Step 1: Create Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up (free tier includes 25GB storage)
3. Go to Dashboard

#### Step 2: Get Credentials
Copy these from your Cloudinary Dashboard:
- **Cloud Name**
- **API Key**
- **API Secret**

#### Step 3: Configure Environment
```bash
# Edit server/.env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Step 4: Migrate Existing Images (Optional)
```bash
cd server
npm run migrate-cloudinary
```

---

### 4. Production Deployment

#### Environment Variables
Create `server/.env.production`:
```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flowbites

JWT_ACCESS_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PLATFORM_FEE_PERCENT=20
STRIPE_CONNECT_CLIENT_ID=ca_your_client_id

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

CLIENT_URL=https://flowbites.com
```

#### Deploy with Docker
```bash
# Build and deploy
./deploy.sh

# Or manually
docker-compose --env-file .env.production up -d --build
```

---

## 💳 How Live Payments Work

### For Buyers:
1. Add template to cart
2. Checkout with Stripe
3. Payment processed immediately
4. Access template in downloads

### For Creators:
1. Connect Stripe account (via Stripe Connect)
2. Upload templates
3. Get paid automatically on each sale
4. Platform fee (default 20%) deducted automatically

### Platform Revenue:
- You keep the platform fee percentage
- Example: $100 sale - $80 to creator, $20 to platform

---

## 📸 Image Management

### Automatic Cloudinary Features:
- ✅ Auto-optimization of all images
- ✅ Multiple format support (WebP, AVIF)
- ✅ Responsive images
- ✅ CDN delivery worldwide
- ✅ Automatic backups

### Image Upload Flow:
1. Creator uploads image
2. Server stores temporarily
3. Cloudinary uploads and optimizes
4. Cloud URL saved to database
5. Local file cleaned up

---

## 👥 Managing Creators

### Via Admin Dashboard:
1. Login at `/admin/login`
2. Go to "Creators" tab
3. View pending verifications
4. Approve/reject creator applications
5. Monitor creator performance

### Creator Verification Required:
- ✅ Personal information
- ✅ Government ID
- ✅ Selfie verification
- ✅ Bank details
- ✅ Creator reference

---

## 🎨 Managing Templates

### Template Approval Flow:
1. Creator uploads template (status: `draft`)
2. Creator submits for review (status: `pending`)
3. Admin reviews in dashboard
4. Admin approves/rejects
5. Template goes live (status: `approved`)

### Edit Tracking:
- All edits logged with changelog
- Shows what changed, when, and by whom
- Creators can edit approved templates (except demo URL)

---

## 🔐 Security Best Practices

### Before Going Live:
1. **Change all default passwords**
2. **Generate new JWT secrets** (32+ characters)
3. **Enable 2FA on Stripe account**
4. **Set up Cloudinary restricted folders**
5. **Configure rate limiting** (already set)
6. **Enable HTTPS only**
7. **Set up monitoring/logging**

### Admin Access:
- Super Admin: Full control, can manage other admins
- Admin: Manage templates, creators, orders
- Both require separate login at `/admin/login`

---

## 📊 Monitoring Your Marketplace

### Key Metrics to Track:
- Total sales and revenue
- Creator onboarding rate
- Template approval time
- Customer satisfaction
- Platform uptime

### Admin Dashboard Shows:
- Pending template reviews
- Pending creator verifications
- Total users and creators
- Revenue statistics
- Recent orders

---

## 🆘 Troubleshooting

### Stripe Issues:
- **"Payment failed"** → Check Stripe dashboard for declined reasons
- **"Webhook not working"** → Verify webhook URL and secret
- **"Connect not working"** → Ensure Client ID is correct

### Cloudinary Issues:
- **"Images not uploading"** → Check API credentials
- **"Slow images"** → Enable CDN in Cloudinary settings
- **"Storage full"** → Upgrade plan or delete old images

### General Issues:
- **"Can't login as admin"** → Ensure role is 'admin' or 'super_admin'
- **"Changes not saving"** → Check MongoDB connection

---

## 🌐 Your Live Site

Once deployed, your marketplace will be at:
- **Main Site:** https://flowbites.com
- **Admin Portal:** https://flowbites.com/admin/login
- **API:** https://api.flowbites.com (or same domain)

---

## 📞 Need Help?

### Useful Commands:
```bash
# Check server logs
docker logs flowbites-server

# Restart services
docker-compose restart

# Database backup
mongodump --uri="your_mongodb_uri" --out=./backup

# View Stripe webhook logs
stripe logs tail --api-key sk_live_...
```

---

## ✅ Final Launch Checklist

- [ ] Stripe account verified and live keys added
- [ ] Cloudinary account configured
- [ ] MongoDB production database connected
- [ ] JWT secrets changed from defaults
- [ ] All passwords changed from defaults
- [ ] Domain configured with SSL
- [ ] Email/SMTP configured (optional)
- [ ] Google Analytics added (optional)
- [ ] Test purchase made successfully
- [ ] Creator payout tested
- [ ] Admin dashboard accessible
- [ ] Terms of Service and Privacy Policy pages created

---

**🎉 You're ready to launch! Start selling those templates!**
