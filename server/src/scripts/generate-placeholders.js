import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');

// ──────────────────────────────────────────────────────────────
// Directory Setup
// ──────────────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(ROOT, 'uploads');
const IMAGES_DIR = path.join(UPLOAD_DIR, 'images');
const SHOTS_DIR = path.join(UPLOAD_DIR, 'shots');
const TEMPLATES_DIR = path.join(UPLOAD_DIR, 'templates');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  Created directory: ${dir}`);
  }
};

// ──────────────────────────────────────────────────────────────
// Color Palettes — one per template "family"
// ──────────────────────────────────────────────────────────────
const PALETTES = {
  dashboard:  { bg1: '#0f172a', bg2: '#1e3a5f', accent: '#38bdf8', text: '#e2e8f0', label: 'SaaS Dashboard Pro' },
  landing:    { bg1: '#4f46e5', bg2: '#7c3aed', accent: '#a78bfa', text: '#f5f3ff', label: 'Startup Landing Kit' },
  portfolio:  { bg1: '#1c1917', bg2: '#44403c', accent: '#f59e0b', text: '#fef3c7', label: 'Elegant Portfolio' },
  restaurant: { bg1: '#7f1d1d', bg2: '#b91c1c', accent: '#fbbf24', text: '#fef2f2', label: 'Flavor Kitchen' },
  medcare:    { bg1: '#064e3b', bg2: '#047857', accent: '#34d399', text: '#ecfdf5', label: 'MedCare Clinic' },
  learnhub:   { bg1: '#1e3a8a', bg2: '#2563eb', accent: '#93c5fd', text: '#eff6ff', label: 'LearnHub Platform' },
  realhome:   { bg1: '#0c4a6e', bg2: '#0284c7', accent: '#38bdf8', text: '#f0f9ff', label: 'RealHome Listings' },
  wanderlust: { bg1: '#134e4a', bg2: '#0d9488', accent: '#5eead4', text: '#f0fdfa', label: 'Wanderlust Travel' },
  shopnest:   { bg1: '#78350f', bg2: '#d97706', accent: '#fbbf24', text: '#fffbeb', label: 'ShopNest E-Commerce' },
  glowup:     { bg1: '#831843', bg2: '#db2777', accent: '#f9a8d4', text: '#fdf2f8', label: 'GlowUp Salon' },
  docuflow:   { bg1: '#312e81', bg2: '#4338ca', accent: '#818cf8', text: '#eef2ff', label: 'DocuFlow Docs' },
  fitlife:    { bg1: '#14532d', bg2: '#16a34a', accent: '#86efac', text: '#f0fdf4', label: 'FitLife Wellness' },
};

const SHOT_PALETTES = {
  'shot-dashboard':  { bg1: '#0f172a', bg2: '#334155', accent: '#0ea5e9', text: '#e2e8f0', label: 'Dashboard Analytics' },
  'shot-ecommerce':  { bg1: '#451a03', bg2: '#92400e', accent: '#f59e0b', text: '#fffbeb', label: 'E-Commerce Cards' },
  'shot-travel':     { bg1: '#164e63', bg2: '#0891b2', accent: '#22d3ee', text: '#ecfeff', label: 'Travel Hero Section' },
};

// ──────────────────────────────────────────────────────────────
// SVG Generators
// ──────────────────────────────────────────────────────────────

/**
 * Creates a professional-looking SVG placeholder with:
 * - Linear gradient background
 * - Subtle grid pattern overlay
 * - Centered label text with subtext
 * - Decorative geometric elements
 */
function generateSVG({ width, height, palette, subtitle }) {
  const { bg1, bg2, accent, text, label } = palette;
  const id = `g${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

  // Build decorative shapes — three translucent circles
  const circles = [
    { cx: width * 0.15, cy: height * 0.3,  r: width * 0.18, opacity: 0.06 },
    { cx: width * 0.85, cy: height * 0.7,  r: width * 0.22, opacity: 0.05 },
    { cx: width * 0.5,  cy: height * 0.15, r: width * 0.12, opacity: 0.07 },
  ];

  // Decorative rectangles (abstract UI elements)
  const rects = [
    { x: width * 0.08, y: height * 0.65, w: width * 0.18, h: 4, rx: 2, opacity: 0.15 },
    { x: width * 0.08, y: height * 0.70, w: width * 0.12, h: 4, rx: 2, opacity: 0.10 },
    { x: width * 0.74, y: height * 0.25, w: width * 0.18, h: 4, rx: 2, opacity: 0.15 },
    { x: width * 0.74, y: height * 0.30, w: width * 0.14, h: 4, rx: 2, opacity: 0.10 },
  ];

  // Accent line at the bottom
  const lineY = height - 4;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="${id}_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <linearGradient id="${id}_accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${accent}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="${id}_grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${text}" stroke-width="0.3" opacity="0.08"/>
    </pattern>
  </defs>

  <!-- Background gradient -->
  <rect width="${width}" height="${height}" fill="url(#${id}_bg)"/>

  <!-- Grid overlay -->
  <rect width="${width}" height="${height}" fill="url(#${id}_grid)"/>

  <!-- Decorative circles -->
${circles.map(c => `  <circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${text}" opacity="${c.opacity}"/>`).join('\n')}

  <!-- Decorative bars -->
${rects.map(r => `  <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.rx}" fill="${text}" opacity="${r.opacity}"/>`).join('\n')}

  <!-- Accent bottom line -->
  <rect x="0" y="${lineY}" width="${width}" height="4" fill="url(#${id}_accent)"/>

  <!-- Small accent diamond -->
  <g transform="translate(${width / 2}, ${height * 0.36})">
    <rect x="-8" y="-8" width="16" height="16" rx="2" fill="${accent}" opacity="0.25" transform="rotate(45)"/>
  </g>

  <!-- Title -->
  <text x="${width / 2}" y="${height * 0.50}" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="${Math.round(width * 0.032)}" font-weight="700" fill="${text}" letter-spacing="0.5">${escapeXml(label)}</text>

  <!-- Subtitle -->
  <text x="${width / 2}" y="${height * 0.56}" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="${Math.round(width * 0.016)}" fill="${accent}" letter-spacing="1.5" font-weight="400">${escapeXml(subtitle)}</text>

  <!-- Dimensions badge -->
  <rect x="${width - 116}" y="12" width="104" height="26" rx="13" fill="${bg1}" opacity="0.6"/>
  <text x="${width - 64}" y="30" text-anchor="middle" font-family="monospace" font-size="11" fill="${text}" opacity="0.6">${width} × ${height}</text>
</svg>`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ──────────────────────────────────────────────────────────────
// Minimal valid ZIP generator (no external deps)
// ──────────────────────────────────────────────────────────────

/**
 * Builds a minimal valid ZIP file containing a single readme.txt.
 * Implements the ZIP format spec (Local File Header + Central Directory + EOCD).
 */
function createMinimalZip(templateName) {
  const fileName = 'readme.txt';
  const fileContent = `${templateName}\n\nThis is a placeholder template package from Flowbites Marketplace.\nReplace this with actual template files.\n`;

  const fileNameBuf = Buffer.from(fileName, 'utf8');
  const fileContentBuf = Buffer.from(fileContent, 'utf8');

  const crc = crc32(fileContentBuf);
  const compressedSize = fileContentBuf.length;
  const uncompressedSize = fileContentBuf.length;

  // ─── Local File Header ───
  const lfh = Buffer.alloc(30 + fileNameBuf.length);
  lfh.writeUInt32LE(0x04034b50, 0);       // Local file header signature
  lfh.writeUInt16LE(20, 4);               // Version needed to extract (2.0)
  lfh.writeUInt16LE(0, 6);                // General purpose bit flag
  lfh.writeUInt16LE(0, 8);                // Compression method (0 = stored)
  lfh.writeUInt16LE(0, 10);               // Last mod file time
  lfh.writeUInt16LE(0, 12);               // Last mod file date
  lfh.writeUInt32LE(crc, 14);             // CRC-32
  lfh.writeUInt32LE(compressedSize, 18);  // Compressed size
  lfh.writeUInt32LE(uncompressedSize, 22);// Uncompressed size
  lfh.writeUInt16LE(fileNameBuf.length, 26); // File name length
  lfh.writeUInt16LE(0, 28);               // Extra field length
  fileNameBuf.copy(lfh, 30);

  // ─── Central Directory Header ───
  const cdOffset = lfh.length + fileContentBuf.length;
  const cdh = Buffer.alloc(46 + fileNameBuf.length);
  cdh.writeUInt32LE(0x02014b50, 0);       // Central directory header signature
  cdh.writeUInt16LE(20, 4);               // Version made by
  cdh.writeUInt16LE(20, 6);               // Version needed to extract
  cdh.writeUInt16LE(0, 8);                // General purpose bit flag
  cdh.writeUInt16LE(0, 10);               // Compression method
  cdh.writeUInt16LE(0, 12);               // Last mod file time
  cdh.writeUInt16LE(0, 14);               // Last mod file date
  cdh.writeUInt32LE(crc, 16);             // CRC-32
  cdh.writeUInt32LE(compressedSize, 20);  // Compressed size
  cdh.writeUInt32LE(uncompressedSize, 24);// Uncompressed size
  cdh.writeUInt16LE(fileNameBuf.length, 28); // File name length
  cdh.writeUInt16LE(0, 30);               // Extra field length
  cdh.writeUInt16LE(0, 32);               // File comment length
  cdh.writeUInt16LE(0, 34);               // Disk number start
  cdh.writeUInt16LE(0, 36);               // Internal file attributes
  cdh.writeUInt32LE(0, 38);               // External file attributes
  cdh.writeUInt32LE(0, 42);               // Relative offset of local header
  fileNameBuf.copy(cdh, 46);

  // ─── End of Central Directory Record ───
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);      // EOCD signature
  eocd.writeUInt16LE(0, 4);               // Number of this disk
  eocd.writeUInt16LE(0, 6);               // Disk where CD starts
  eocd.writeUInt16LE(1, 8);               // Number of CD records on this disk
  eocd.writeUInt16LE(1, 10);              // Total number of CD records
  eocd.writeUInt32LE(cdh.length, 12);     // Size of central directory
  eocd.writeUInt32LE(cdOffset, 16);       // Offset of start of CD
  eocd.writeUInt16LE(0, 20);              // Comment length

  return Buffer.concat([lfh, fileContentBuf, cdh, eocd]);
}

/**
 * CRC-32 implementation (no external deps).
 */
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ──────────────────────────────────────────────────────────────
// Image & Template File Definitions
// ──────────────────────────────────────────────────────────────

const THUMBNAILS = [
  { file: 'dashboard-thumb.svg', key: 'dashboard', subtitle: 'THUMBNAIL' },
  { file: 'landing-thumb.svg',   key: 'landing',   subtitle: 'THUMBNAIL' },
  { file: 'portfolio-thumb.svg', key: 'portfolio', subtitle: 'THUMBNAIL' },
  { file: 'restaurant-thumb.svg', key: 'restaurant', subtitle: 'THUMBNAIL' },
  { file: 'medcare-thumb.svg',   key: 'medcare',   subtitle: 'THUMBNAIL' },
  { file: 'learnhub-thumb.svg',  key: 'learnhub',  subtitle: 'THUMBNAIL' },
  { file: 'realhome-thumb.svg',  key: 'realhome',  subtitle: 'THUMBNAIL' },
  { file: 'wanderlust-thumb.svg', key: 'wanderlust', subtitle: 'THUMBNAIL' },
  { file: 'shopnest-thumb.svg',  key: 'shopnest',  subtitle: 'THUMBNAIL' },
  { file: 'glowup-thumb.svg',    key: 'glowup',    subtitle: 'THUMBNAIL' },
  { file: 'docuflow-thumb.svg',  key: 'docuflow',  subtitle: 'THUMBNAIL' },
  { file: 'fitlife-thumb.svg',   key: 'fitlife',   subtitle: 'THUMBNAIL' },
];

const GALLERY = [
  { file: 'dashboard-1.svg', key: 'dashboard', subtitle: 'GALLERY  —  OVERVIEW' },
  { file: 'dashboard-2.svg', key: 'dashboard', subtitle: 'GALLERY  —  ANALYTICS' },
  { file: 'dashboard-3.svg', key: 'dashboard', subtitle: 'GALLERY  —  SETTINGS' },
  { file: 'landing-1.svg',   key: 'landing',   subtitle: 'GALLERY  —  HERO' },
  { file: 'landing-2.svg',   key: 'landing',   subtitle: 'GALLERY  —  FEATURES' },
  { file: 'portfolio-1.svg', key: 'portfolio', subtitle: 'GALLERY  —  PROJECTS' },
  { file: 'portfolio-2.svg', key: 'portfolio', subtitle: 'GALLERY  —  DETAIL' },
  { file: 'restaurant-1.svg', key: 'restaurant', subtitle: 'GALLERY  —  MENU' },
  { file: 'restaurant-2.svg', key: 'restaurant', subtitle: 'GALLERY  —  RESERVATION' },
  { file: 'medcare-1.svg',   key: 'medcare',   subtitle: 'GALLERY  —  SERVICES' },
  { file: 'medcare-2.svg',   key: 'medcare',   subtitle: 'GALLERY  —  BOOKING' },
  { file: 'learnhub-1.svg',  key: 'learnhub',  subtitle: 'GALLERY  —  COURSES' },
  { file: 'learnhub-2.svg',  key: 'learnhub',  subtitle: 'GALLERY  —  LESSON' },
  { file: 'learnhub-3.svg',  key: 'learnhub',  subtitle: 'GALLERY  —  DASHBOARD' },
  { file: 'realhome-1.svg',  key: 'realhome',  subtitle: 'GALLERY  —  LISTINGS' },
  { file: 'realhome-2.svg',  key: 'realhome',  subtitle: 'GALLERY  —  PROPERTY' },
  { file: 'wanderlust-1.svg', key: 'wanderlust', subtitle: 'GALLERY  —  DESTINATIONS' },
  { file: 'wanderlust-2.svg', key: 'wanderlust', subtitle: 'GALLERY  —  BOOKING' },
  { file: 'shopnest-1.svg',  key: 'shopnest',  subtitle: 'GALLERY  —  CATALOG' },
  { file: 'shopnest-2.svg',  key: 'shopnest',  subtitle: 'GALLERY  —  PRODUCT' },
  { file: 'shopnest-3.svg',  key: 'shopnest',  subtitle: 'GALLERY  —  CART' },
  { file: 'glowup-1.svg',    key: 'glowup',    subtitle: 'GALLERY  —  SERVICES' },
  { file: 'glowup-2.svg',    key: 'glowup',    subtitle: 'GALLERY  —  BOOKING' },
  { file: 'docuflow-1.svg',  key: 'docuflow',  subtitle: 'GALLERY  —  DOCUMENTATION' },
  { file: 'fitlife-1.svg',   key: 'fitlife',   subtitle: 'GALLERY  —  CLASSES' },
  { file: 'fitlife-2.svg',   key: 'fitlife',   subtitle: 'GALLERY  —  MEMBERSHIP' },
];

const SHOTS = [
  { file: 'shot-dashboard.svg',  key: 'shot-dashboard',  subtitle: 'UI SHOT' },
  { file: 'shot-ecommerce.svg',  key: 'shot-ecommerce',  subtitle: 'UI SHOT' },
  { file: 'shot-travel.svg',     key: 'shot-travel',      subtitle: 'UI SHOT' },
];

const TEMPLATE_ZIPS = [
  { file: 'saas-dashboard-pro.zip',    label: 'Modern SaaS Dashboard Pro' },
  { file: 'startup-landing-kit.zip',   label: 'Startup Landing Page Kit' },
  { file: 'elegant-portfolio.zip',     label: 'Elegant Portfolio Studio' },
  { file: 'flavor-kitchen.zip',        label: 'Flavor Kitchen — Restaurant Template' },
  { file: 'medcare-clinic.zip',        label: 'MedCare Health Clinic' },
  { file: 'learnhub-platform.zip',     label: 'LearnHub — Online Course Platform' },
  { file: 'realhome-listings.zip',     label: 'RealHome Property Listings' },
  { file: 'wanderlust-travel.zip',     label: 'Wanderlust Travel Agency' },
  { file: 'shopnest-ecommerce.zip',    label: 'ShopNest E-Commerce Starter' },
  { file: 'glowup-salon.zip',          label: 'GlowUp Beauty Salon' },
  { file: 'docuflow-docs.zip',         label: 'DocuFlow Documentation Kit' },
  { file: 'fitlife-wellness.zip',      label: 'FitLife Wellness Hub' },
];

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────

function generate() {
  console.log('');
  console.log('==============================================');
  console.log('  Flowbites — Placeholder Asset Generator');
  console.log('==============================================');
  console.log('');

  // 1. Ensure directories
  console.log('[1/4] Creating directories...');
  [UPLOAD_DIR, IMAGES_DIR, SHOTS_DIR, TEMPLATES_DIR].forEach(ensureDir);
  console.log('');

  // 2. Generate thumbnail SVGs (1200x750)
  console.log('[2/4] Generating thumbnail images...');
  let count = 0;
  for (const t of THUMBNAILS) {
    const svg = generateSVG({
      width: 1200,
      height: 750,
      palette: PALETTES[t.key],
      subtitle: t.subtitle,
    });
    const filePath = path.join(IMAGES_DIR, t.file);
    fs.writeFileSync(filePath, svg, 'utf8');
    count++;
  }

  // Generate gallery SVGs (1200x750)
  for (const g of GALLERY) {
    const svg = generateSVG({
      width: 1200,
      height: 750,
      palette: PALETTES[g.key],
      subtitle: g.subtitle,
    });
    const filePath = path.join(IMAGES_DIR, g.file);
    fs.writeFileSync(filePath, svg, 'utf8');
    count++;
  }
  console.log(`  Generated ${count} images in ${IMAGES_DIR}`);
  console.log('');

  // 3. Generate UI shot SVGs (800x600)
  console.log('[3/4] Generating UI shot images...');
  for (const s of SHOTS) {
    const svg = generateSVG({
      width: 800,
      height: 600,
      palette: SHOT_PALETTES[s.key],
      subtitle: s.subtitle,
    });
    const filePath = path.join(SHOTS_DIR, s.file);
    fs.writeFileSync(filePath, svg, 'utf8');
  }
  console.log(`  Generated ${SHOTS.length} shots in ${SHOTS_DIR}`);
  console.log('');

  // 4. Generate template ZIP files
  console.log('[4/4] Generating template ZIP files...');
  for (const z of TEMPLATE_ZIPS) {
    const zipBuf = createMinimalZip(z.label);
    const filePath = path.join(TEMPLATES_DIR, z.file);
    fs.writeFileSync(filePath, zipBuf);
  }
  console.log(`  Generated ${TEMPLATE_ZIPS.length} template archives in ${TEMPLATES_DIR}`);
  console.log('');

  // Summary
  const totalFiles = count + SHOTS.length + TEMPLATE_ZIPS.length;
  console.log('----------------------------------------------');
  console.log(`  Done! ${totalFiles} placeholder files created.`);
  console.log('----------------------------------------------');
  console.log('');
  console.log('  Thumbnails:  12  (1200x750 SVG)');
  console.log('  Gallery:     26  (1200x750 SVG)');
  console.log('  UI Shots:     3  (800x600 SVG)');
  console.log('  Templates:   12  (valid ZIP w/ readme.txt)');
  console.log('');
  console.log('  Next step: Update seed data references from');
  console.log('  .jpg to .svg if you haven\'t already, then');
  console.log('  run `npm run seed` to populate the database.');
  console.log('');
}

generate();
