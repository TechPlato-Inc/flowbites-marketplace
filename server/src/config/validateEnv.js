/**
 * Validate required environment variables on startup.
 * Warns for optional vars, exits for critical ones.
 */
export function validateEnv() {
  const required = [
    { key: 'MONGODB_URI', hint: 'MongoDB connection string (e.g., mongodb://localhost:27017/flowbites-marketplace)' },
    { key: 'JWT_ACCESS_SECRET', hint: 'Secret key for JWT access tokens' },
    { key: 'JWT_REFRESH_SECRET', hint: 'Secret key for JWT refresh tokens' },
  ];

  const optional = [
    { key: 'STRIPE_SECRET_KEY', hint: 'Stripe API key — without it, payments run in demo mode' },
    { key: 'RESEND_API_KEY', hint: 'Resend API key — without it, emails are logged to console' },
    { key: 'CLOUDINARY_CLOUD_NAME', hint: 'Cloudinary cloud name — without it, uploads use local storage' },
    { key: 'CLIENT_URL', hint: 'Frontend URL — defaults to http://localhost:3000' },
  ];

  const missing = [];
  const warnings = [];

  for (const { key, hint } of required) {
    if (!process.env[key]) {
      missing.push(`  ${key} — ${hint}`);
    }
  }

  for (const { key, hint } of optional) {
    if (!process.env[key]) {
      warnings.push(`  ${key} — ${hint}`);
    }
  }

  // Check for insecure JWT secrets in production
  if (process.env.NODE_ENV === 'production') {
    const insecureDefaults = ['your-super-secret', 'change-this', 'secret', 'test'];
    for (const secretKey of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
      const val = process.env[secretKey] || '';
      if (insecureDefaults.some(d => val.toLowerCase().includes(d))) {
        missing.push(`  ${secretKey} — Using insecure default value in production!`);
      }
    }
  }

  if (warnings.length > 0) {
    console.log('⚠️  Optional env vars not set (features will run in fallback mode):');
    warnings.forEach(w => console.log(w));
    console.log('');
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(m => console.error(m));
    console.error('\nCopy .env.example to .env and fill in the values.');
    process.exit(1);
  }
}
