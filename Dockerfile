# =============================================================================
# Flowbites Marketplace - Multi-Stage Dockerfile
# =============================================================================
# Architecture: Express API (port 5000) + Next.js SSR (port 3000)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Build the Next.js client application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS client-build

WORKDIR /app/client

# Copy package files first for better Docker layer caching
COPY next-client/package.json next-client/package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the client source code
COPY next-client/ ./

# Set build-time env vars for Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_UPLOADS_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-/api}
ENV NEXT_PUBLIC_UPLOADS_URL=${NEXT_PUBLIC_UPLOADS_URL:-/uploads}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://flowbites.com}

# Build the production Next.js bundle (standalone output)
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Express API production server
# ---------------------------------------------------------------------------
FROM node:20-alpine AS api

# Set non-root user for security
RUN addgroup -S flowbites && adduser -S flowbites -G flowbites

WORKDIR /app
ENV NODE_ENV=production

# Copy server package files and install production dependencies only
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Copy server source code
COPY server/src ./src

# Create uploads directories
RUN mkdir -p uploads/images uploads/templates uploads/shots

# Copy seed images (thumbnails, gallery, UI shots)
COPY server/uploads/images ./uploads/images
COPY server/uploads/shots ./uploads/shots

# Set ownership
RUN chown -R flowbites:flowbites /app

# Switch to non-root user
USER flowbites

# Expose the server port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the production server
CMD ["node", "src/index.js"]

# ---------------------------------------------------------------------------
# Stage 3: Next.js SSR production server (standalone)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS client

RUN addgroup -S flowbites && adduser -S flowbites -G flowbites

WORKDIR /app

# Copy the standalone Next.js output
COPY --from=client-build /app/client/.next/standalone ./
COPY --from=client-build /app/client/.next/static ./.next/static
COPY --from=client-build /app/client/public ./public

# Set ownership
RUN chown -R flowbites:flowbites /app

USER flowbites

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
