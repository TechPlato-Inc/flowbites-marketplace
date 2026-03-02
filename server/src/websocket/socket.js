import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getCachedUser } from '../lib/userCache.js';
import logger from '../lib/logger.js';

/** @type {Server|null} */
let io = null;

/**
 * Map of userId → Set<socketId> so one user can have multiple tabs.
 * @type {Map<string, Set<string>>}
 */
const userSockets = new Map();

/**
 * Initialize Socket.IO on an existing HTTP server.
 *
 * @param {import('http').Server} httpServer
 * @returns {Server}
 */
export function initializeSocket(httpServer) {
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [process.env.CLIENT_URL, process.env.SITE_URL].filter(Boolean)
      : [
          process.env.CLIENT_URL,
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'http://localhost:5174',
        ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    // Only use WebSocket — skip long-polling to keep Railway/Vercel happy
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // ── Auth middleware — verify JWT from cookie or auth header ──────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        parseCookie(socket.handshake.headers.cookie, 'accessToken');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        algorithms: ['HS256'],
      });

      const user = await getCachedUser(decoded.userId, '_id name role');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection handler ──────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const uid = socket.userId;

    // Track user → sockets
    if (!userSockets.has(uid)) {
      userSockets.set(uid, new Set());
    }
    userSockets.get(uid).add(socket.id);

    // Join a personal room for targeted pushes
    socket.join(`user:${uid}`);

    // Admins join the admin room for real-time dashboard events
    if (socket.userRole === 'admin' || socket.userRole === 'super_admin') {
      socket.join('admin');
    }

    logger.info({ userId: uid, userName: socket.userName, tabs: userSockets.get(uid).size }, 'Socket connected');

    // ── Client events ────────────────────────────────────────────────────
    socket.on('notification:mark_read', (notificationId) => {
      // The actual DB update is done via REST; this is for multi-tab sync
      socket.to(`user:${uid}`).emit('notification:marked_read', notificationId);
    });

    socket.on('notification:mark_all_read', () => {
      socket.to(`user:${uid}`).emit('notification:all_marked_read');
    });

    // ── Disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const sockets = userSockets.get(uid);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(uid);
        }
      }
      logger.info({ userId: uid, userName: socket.userName }, 'Socket disconnected');
    });
  });

  // ── Periodic cleanup of stale entries ──────────────────────────────────
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const cleanupTimer = setInterval(() => {
    let removed = 0;
    for (const [userId, socketIds] of userSockets.entries()) {
      for (const sid of socketIds) {
        if (!io.sockets.sockets.has(sid)) {
          socketIds.delete(sid);
          removed++;
        }
      }
      if (socketIds.size === 0) {
        userSockets.delete(userId);
      }
    }
    if (removed > 0) {
      logger.info({ removed }, 'Cleaned up stale socket entries');
    }
  }, CLEANUP_INTERVAL);
  cleanupTimer.unref();

  return io;
}

// ── Public helpers for pushing events from anywhere in the backend ─────────

/**
 * Send a real-time notification to a specific user.
 * Falls back silently if Socket.IO isn't initialized.
 */
export function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${userId.toString()}`).emit(event, data);
}

/**
 * Send an event to all connected clients (e.g. system broadcast).
 */
export function emitToAll(event, data) {
  if (!io) return;
  io.emit(event, data);
}

/**
 * Send an event to all connected admin users (for real-time dashboard).
 */
export function emitToAdmins(event, data) {
  if (!io) return;
  io.to('admin').emit(event, data);
}

/**
 * Check if a user has any active WebSocket connections.
 */
export function isUserOnline(userId) {
  return userSockets.has(userId.toString());
}

/**
 * Get the Socket.IO server instance.
 */
export function getIO() {
  return io;
}

// ── Internal helpers ──────────────────────────────────────────────────────

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? match.split('=')[1] : null;
}
