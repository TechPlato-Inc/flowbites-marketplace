#!/usr/bin/env node
import fs from 'fs';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseMongoHost(uri) {
  const normalized = uri.replace(/^mongodb(?:\+srv)?:\/\//, '');
  const hostSection = normalized.split('/')[0].split('@').pop();
  const firstHost = hostSection.split(',')[0];
  const [host, port] = firstHost.split(':');
  return { host, port: port ? Number(port) : 27017, isSrv: uri.startsWith('mongodb+srv://') };
}

function checkTcpConnection(host, port, timeoutMs = 3000) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port });
    let settled = false;

    const done = (ok, detail) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, detail });
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true, `Connected to ${host}:${port}`));
    socket.once('timeout', () => done(false, `Timeout connecting to ${host}:${port}`));
    socket.once('error', err => done(false, `Connection error: ${err.message}`));
  });
}

async function checkApiHealth(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
    const body = await res.json().catch(() => ({}));
    return {
      ok: Boolean(body?.success),
      detail: body?.message || 'Health endpoint responded',
    };
  } catch (err) {
    return { ok: false, detail: err.message };
  }
}

function checkEnvPresence(keys) {
  const missing = keys.filter(k => !process.env[k]);
  return {
    ok: missing.length === 0,
    detail: missing.length === 0 ? 'All required variables set' : `Missing: ${missing.join(', ')}`,
  };
}

function checkFormat(name, value, prefix) {
  if (!value) return { ok: true, detail: `${name} not set (optional)` };
  return value.startsWith(prefix)
    ? { ok: true, detail: `${name} format looks valid` }
    : { ok: false, detail: `${name} should start with "${prefix}"` };
}

function checkCloudinary() {
  const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const present = keys.filter(k => Boolean(process.env[k]));
  if (present.length === 0) {
    return { ok: true, detail: 'Cloudinary not configured (optional)' };
  }
  const missing = keys.filter(k => !process.env[k]);
  return {
    ok: missing.length === 0,
    detail: missing.length === 0 ? 'Cloudinary config present' : `Missing: ${missing.join(', ')}`,
  };
}

async function run() {
  loadEnvFile(path.join(serverDir, '.env'));
  loadEnvFile(path.join(rootDir, '.env'));

  const results = [];

  const requiredEnv = checkEnvPresence(['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']);
  results.push({ check: 'Required env vars', required: true, ...requiredEnv });

  const mongoUri = process.env.MONGODB_URI || '';
  if (!mongoUri) {
    results.push({ check: 'MongoDB connection', required: true, ok: false, detail: 'MONGODB_URI not set' });
  } else {
    const { host, port, isSrv } = parseMongoHost(mongoUri);
    if (isSrv) {
      results.push({
        check: 'MongoDB connection',
        required: true,
        ok: true,
        detail: `SRV URI detected (${host}); raw TCP check skipped`,
      });
    } else {
      const mongo = await checkTcpConnection(host, port);
      results.push({ check: 'MongoDB connection', required: true, ...mongo });
    }
  }

  const port = process.env.PORT || 5000;
  const api = await checkApiHealth(`http://127.0.0.1:${port}/health`);
  results.push({ check: 'API /health', required: true, ...api });

  results.push({ check: 'Cloudinary config', required: false, ...checkCloudinary() });
  results.push({
    check: 'Stripe secret format',
    required: false,
    ...checkFormat('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY, 'sk_'),
  });
  results.push({
    check: 'Stripe webhook format',
    required: false,
    ...checkFormat('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET, 'whsec_'),
  });
  results.push({
    check: 'Resend API key format',
    required: false,
    ...checkFormat('RESEND_API_KEY', process.env.RESEND_API_KEY, 're_'),
  });

  const table = results.map(r => ({
    Check: r.check,
    Required: r.required ? 'yes' : 'no',
    Status: r.ok ? 'PASS' : 'FAIL',
    Detail: r.detail,
  }));
  console.table(table);

  const requiredFailures = results.filter(r => r.required && !r.ok);
  if (requiredFailures.length > 0) {
    console.error(`Health check failed: ${requiredFailures.length} required check(s) failed.`);
    process.exit(1);
  }
  console.log('Health check passed.');
}

run().catch(err => {
  console.error('Health check crashed:', err);
  process.exit(1);
});
