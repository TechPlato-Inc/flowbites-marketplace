# Launch Guide

## Pre-Launch Setup

### Admin Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Super Admin** | superadmin@flowbites.com | superadmin2024! | Full control |
| **Admin** | admin@flowbites.com | flowbites2024! | Manage content |
| **Creator** | flowbites@flowbites.com | flowbites123 | Upload templates |

**Admin Portal:** `/admin/login`

### Stripe Configuration

1. **Create Account:** stripe.com → Sign up → Complete verification → Switch to Live Mode

2. **Get API Keys:**
   - Developers → API Keys → Copy **Secret Key** (`sk_live_...`)
   - Developers → Webhooks → Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `charge.refunded`
   - Copy **Webhook Secret** (`whsec_...`)

3. **Stripe Connect:**
   - Settings → Connect → Enable
   - Copy **Client ID** (`ca_...`)

4. **Environment Variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_CONNECT_CLIENT_ID=ca_...
   STRIPE_PLATFORM_FEE_PERCENT=20
   ```

### Cloudinary Setup

1. **Create Account:** cloudinary.com (free tier: 25GB)
2. **Get Credentials** from Dashboard:
   - Cloud Name, API Key, API Secret
3. **Environment Variables:**
   ```bash
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

### Production Checklist

- [ ] Stripe live keys configured
- [ ] Cloudinary configured
- [ ] MongoDB production database connected
- [ ] JWT secrets changed from defaults
- [ ] All default passwords changed
- [ ] Domain configured with SSL
- [ ] Email service configured
- [ ] Test purchase completed
- [ ] Creator payout tested

---

## 4-Week Launch Timeline

### Week 4: Creator Push

**Monday:**
- [ ] Finalize creator agreements
- [ ] Send onboarding emails to 30 creators
- [ ] Host onboarding webinar

**Wednesday:**
- [ ] Review first batch of templates
- [ ] Approve 20 templates

**Friday:**
- [ ] Creator spotlight blog post #1
- [ ] Start social media teaser campaign

### Week 3: Content Production

**Blog Content (5 posts):**
- [ ] "Best Webflow Templates for 2026"
- [ ] "How to Choose the Right Template"
- [ ] "Creator Spotlight: [Name]"
- [ ] "Webflow vs Framer: Which to Choose?"
- [ ] "10 Landing Page Templates That Convert"

**Social Media (20 posts):**
- [ ] Template preview videos (5)
- [ ] Creator testimonials (5)
- [ ] Behind-the-scenes (5)
- [ ] Tips and tricks (5)

**Email Setup:**
- [ ] Welcome sequence (3 emails)
- [ ] Creator onboarding sequence (3 emails)
- [ ] Launch announcement email
- [ ] Waiting list: 500+ subscribers

### Week 2: Community Building

**Reddit:**
- [ ] Join r/webflow, r/framer, r/web_design
- [ ] Provide helpful comments (10/day)

**Twitter/X:**
- [ ] Follow 100 target accounts daily
- [ ] Post daily tips

**Discord:**
- [ ] Join Webflow, Framer servers
- [ ] Participate in discussions

### Week 1: Final Preparations

**Monday-Wednesday (Soft Launch):**
- [ ] Invite 100 beta testers
- [ ] Monitor for critical bugs
- [ ] Collect feedback

**Thursday-Friday (Launch Prep):**
- [ ] Prepare Product Hunt assets
- [ ] Schedule social posts
- [ ] Final email to waiting list

### Launch Day Schedule

**Morning (9 AM):**
- [ ] Final deployment
- [ ] Verify all systems operational
- [ ] Product Hunt post goes live
- [ ] Send launch email

**Midday (12 PM):**
- [ ] Twitter announcement thread
- [ ] LinkedIn launch post
- [ ] Reddit r/webflow post
- [ ] Respond to all comments

**Afternoon (3 PM):**
- [ ] Check analytics
- [ ] Template showcase posts
- [ ] Engage with early users

**Evening (6 PM):**
- [ ] Thank you post to creators
- [ ] Day 1 metrics review
- [ ] Plan Day 2 content

---

## Marketing Strategy

### Target Audience

| Segment | Description | Pain Points |
|---------|-------------|-------------|
| Freelance Web Designers | Solo designers building client sites | Fast turnaround, quality starting points |
| Digital Agencies | Small agencies (2-10 people) | Consistent, professional templates |
| No-Code Entrepreneurs | Non-technical founders | Ready-to-launch sites |
| Template Creators | Designers who build & sell | Distribution, audience, payment handling |

### Unique Selling Propositions

**For Buyers:**
- ✅ Verified Quality - All templates manually reviewed
- ✅ Platform Flexibility - Webflow, Framer, Wix in one place
- ✅ Customization Services - Hire creators for custom work
- ✅ Instant Delivery - Clone/remix links, not file downloads
- ✅ 14-Day Money-Back Guarantee

**For Creators:**
- 💰 70-90% creator revenue share
- 🌍 Built-in audience and SEO
- 🔧 Stripe Connect for direct payouts
- 📊 Analytics dashboard
- 🎨 Version control for templates

### Marketing Channels

1. **Content Marketing (SEO)**
   - Target keywords: "webflow templates" (14k/mo), "framer templates" (2.4k/mo)
   - Weekly: Template roundups, tutorials, creator interviews

2. **Community Marketing**
   - Reddit: r/webflow, r/framer, r/web_design
   - Discord: Webflow, Framer communities
   - Twitter/X: Daily tips, template showcases

3. **Influencer Partnerships**
   - Micro-influencers (1k-10k followers)
   - Free templates for reviews
   - 10-20% affiliate commission

4. **Paid Advertising** (Post-Launch)
   - Google Ads: $500-1000/mo
   - Facebook/Instagram: Lookalike audiences

### Success Metrics (Week 1 Targets)

| Metric | Target |
|--------|--------|
| Website Visitors | 5,000 |
| Registered Users | 500 |
| Template Sales | 50 |
| Creator Signups | 30 |
| Email Subscribers | 200 |

---

## Email Templates

### 1. Welcome Email (New Buyer)

**Subject:** Welcome to Flowbites! Here's 10% off your first template 🎉

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9, #06b6d4); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 40px 20px; }
    .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .discount { background: #fef3c7; border: 2px dashed #f59e0b; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
    .code { font-size: 24px; font-weight: bold; color: #d97706; letter-spacing: 2px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Flowbites!</h1>
    </div>
    <div class="content">
      <h2>Hi {{name}},</h2>
      <p>Thanks for joining Flowbites! You're now part of a community of designers and creators building amazing websites with premium templates.</p>
      <div class="discount">
        <p>Your exclusive welcome discount:</p>
        <div class="code">WELCOME10</div>
        <p>10% off your first purchase</p>
      </div>
      <h3>🚀 Get Started in 3 Steps:</h3>
      <ol>
        <li><strong>Browse Templates</strong> - Filter by platform (Webflow, Framer, Wix)</li>
        <li><strong>Preview Live Demos</strong> - See exactly what you're getting</li>
        <li><strong>Instant Delivery</strong> - Get your clone/remix link immediately</li>
      </ol>
      <p style="text-align: center; margin: 40px 0;">
        <a href="{{templates_url}}" class="button">Browse Templates</a>
      </p>
      <p>Happy building,<br>The Flowbites Team</p>
    </div>
    <div class="footer">
      <p>© 2026 Flowbites Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 2. Creator Welcome Email

**Subject:** Welcome to the Flowbites Creator Program! 🎨

```
Hi {{name}},

Welcome to the Flowbites Creator Program! We're thrilled to have you as one of our founding creators.

💰 YOUR REVENUE SHARE
- First 30 days: 0% platform fee (you keep 100%)
- After launch: 90% creator / 10% platform
- Stripe Connect: Direct payouts to your bank

📤 NEXT STEPS
1. Upload your first template
2. Set up Stripe Connect for payouts
3. Optimize your template listing
4. Share with your audience

🎯 CREATOR RESOURCES
- Creator Dashboard: {{dashboard_url}}
- Upload Guidelines: {{guidelines_url}}
- Support: creators@flowbites.com

🚀 EARLY CREATOR PERKS
- Featured placement on homepage
- Social media promotion
- Priority support
- Revenue guarantee (first month)

Ready to upload? [Upload Template →]

The Flowbites Team
```

### 3. Launch Announcement

**Subject:** 🚀 Flowbites is Live! Premium templates for Webflow, Framer & Wix

```
Hi {{name}},

The day has arrived! Flowbites Marketplace is officially LIVE! 🎉

🎁 LAUNCH SPECIAL: 20% OFF EVERYTHING
Use code: LAUNCH20
Valid for 48 hours only

WHAT'S INSIDE:
✅ 100+ Premium Templates (Webflow, Framer, Wix)
✅ Verified Quality - Every template manually reviewed
✅ Instant Delivery - Clone/remix links, no downloads
✅ Creator Services - Hire pros for custom work
✅ 14-Day Refund Guarantee

POPULAR CATEGORIES:
🚀 SaaS Landing Pages
💼 Portfolio Templates
🛒 E-commerce Sites
📱 Mobile App Landing Pages

[Browse All Templates →]

Questions? Reply to this email - we're here to help!

The Flowbites Team
```

### 4. Abandoned Cart Email

**Subject:** Did you forget something? Your templates are waiting 🛒

```
Hi {{name}},

You left some great templates in your cart:

{{#items}}
- {{name}} - ${{price}}
{{/items}}

Complete your purchase now:
[Complete Checkout →]

Need help deciding? Reply to this email - we're happy to help!

The Flowbites Team
```

### 5. Post-Purchase Email

**Subject:** Your templates are ready! 🎉

```
Hi {{name}},

Thanks for your purchase! Your templates are ready to download.

ORDER: #{{orderNumber}}
TOTAL: ${{total}}

{{#items}}
📦 {{name}}
   [Download Now →]
{{/items}}

GETTING STARTED:
1. Click download links above
2. Import into your platform (Webflow/Framer/Wix)
3. Start customizing!

NEED HELP?
- Documentation: {{help_url}}
- Support: support@flowbites.com

Enjoy your templates!

The Flowbites Team
```

---

## Troubleshooting

### Common Launch Issues

**Stripe Issues:**
- "Payment failed" → Check Stripe dashboard for declined reasons
- "Webhook not working" → Verify URL and secret
- "Connect not working" → Ensure Client ID is correct

**Cloudinary Issues:**
- "Images not uploading" → Check API credentials
- "Slow images" → Enable CDN in Cloudinary settings

**General:**
- "Can't login as admin" → Ensure role is 'admin' or 'super_admin'
- "Changes not saving" → Check MongoDB connection

### Useful Commands

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

**🎉 You're ready to launch!**

*Launch Date: _______________*  
*Launch Lead: ______________*
