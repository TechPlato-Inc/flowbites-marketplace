#!/bin/bash
# =============================================================================
# Flowbites Marketplace - Deployment Script
# =============================================================================
# Usage: ./deploy.sh
# This script:
#   1. Validates .env.production
#   2. Builds and starts containers (HTTP mode)
#   3. Obtains SSL certificate from Let's Encrypt
#   4. Enables HTTPS in nginx config
#   5. Seeds database (optional)
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# -------------------------------------------------------------------------
# Step 1: Check .env.production
# -------------------------------------------------------------------------
ENV_FILE=".env.production"
if [ ! -f "$ENV_FILE" ]; then
    err "Missing $ENV_FILE — copy .env.production.example and fill in your values:\n  cp .env.production.example .env.production"
fi

# Source the env file
set -a
source "$ENV_FILE"
set +a

# Validate required vars
[ -z "$DOMAIN" ] && err "DOMAIN is not set in $ENV_FILE"
[ -z "$MONGO_ROOT_PASSWORD" ] && err "MONGO_ROOT_PASSWORD is not set in $ENV_FILE"
[ -z "$JWT_ACCESS_SECRET" ] && err "JWT_ACCESS_SECRET is not set in $ENV_FILE"
[ -z "$JWT_REFRESH_SECRET" ] && err "JWT_REFRESH_SECRET is not set in $ENV_FILE"
[ -z "$LETSENCRYPT_EMAIL" ] && err "LETSENCRYPT_EMAIL is not set in $ENV_FILE"

log "Domain: $DOMAIN"
log "Email:  $LETSENCRYPT_EMAIL"

# -------------------------------------------------------------------------
# Step 2: Build and start in HTTP mode
# -------------------------------------------------------------------------
log "Building and starting containers (HTTP mode)..."
docker compose --env-file "$ENV_FILE" up -d --build

log "Waiting for services to be healthy..."
sleep 10

# Verify services are running
if ! docker compose --env-file "$ENV_FILE" ps | grep -q "flowbites-api.*running"; then
    warn "API container may not be fully ready yet, waiting more..."
    sleep 15
fi
if ! docker compose --env-file "$ENV_FILE" ps | grep -q "flowbites-client.*running"; then
    warn "Client container may not be fully ready yet, waiting more..."
    sleep 10
fi

log "Testing HTTP access..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/health" || echo "000")
if [ "$HTTP_STATUS" != "200" ]; then
    warn "Health check returned $HTTP_STATUS — container might still be starting"
else
    log "HTTP is working (health check: 200)"
fi

# -------------------------------------------------------------------------
# Step 3: Obtain SSL Certificate
# -------------------------------------------------------------------------
log "Requesting SSL certificate from Let's Encrypt for $DOMAIN..."

docker compose --env-file "$ENV_FILE" run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$LETSENCRYPT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

if [ $? -ne 0 ]; then
    warn "SSL certificate request failed. Your site will work on HTTP only."
    warn "Make sure your DNS is pointing to this server and try again:"
    warn "  docker compose --env-file $ENV_FILE run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email $LETSENCRYPT_EMAIL --agree-tos --no-eff-email -d $DOMAIN -d www.$DOMAIN"
    echo ""
    log "Site is live at: http://$DOMAIN"
    exit 0
fi

log "SSL certificate obtained successfully!"

# -------------------------------------------------------------------------
# Step 4: Enable HTTPS in nginx config
# -------------------------------------------------------------------------
log "Enabling HTTPS in nginx config..."

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx.conf

# Uncomment the SSL server block
sed -i '/# SSL_START/,/# SSL_END/{
    /# SSL_START/d
    /# SSL_END/d
    s/^    # //
    s/^    #$//
}' nginx.conf

# Enable HTTP→HTTPS redirect (replace proxy_pass block with redirect)
sed -i '/# During initial setup/,/}/c\            return 301 https://$host$request_uri;' nginx.conf

# Reload nginx
docker compose --env-file "$ENV_FILE" exec nginx nginx -s reload

log "HTTPS is now active!"

# -------------------------------------------------------------------------
# Step 5: Seed database (optional)
# -------------------------------------------------------------------------
echo ""
read -p "$(echo -e ${BLUE}[DEPLOY]${NC}) Seed database with demo data? (y/N): " SEED_ANSWER
if [ "$SEED_ANSWER" = "y" ] || [ "$SEED_ANSWER" = "Y" ]; then
    log "Seeding database..."
    docker compose --env-file "$ENV_FILE" exec api node src/scripts/seed.js
    log "Database seeded!"
fi

# -------------------------------------------------------------------------
# Done!
# -------------------------------------------------------------------------
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Flowbites Marketplace is LIVE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "  URL:    ${BLUE}https://$DOMAIN${NC}"
echo -e "  Health: ${BLUE}https://$DOMAIN/health${NC}"
echo ""
echo -e "  Admin login: admin@flowbites.com / password123"
echo -e "  ${RED}^ Change this password immediately!${NC}"
echo ""
echo -e "  Useful commands:"
echo -e "    View logs:    docker compose --env-file $ENV_FILE logs -f"
echo -e "    Restart:      docker compose --env-file $ENV_FILE restart"
echo -e "    Stop:         docker compose --env-file $ENV_FILE down"
echo -e "    Update:       git pull && docker compose --env-file $ENV_FILE up -d --build"
echo -e "    Renew SSL:    docker compose --env-file $ENV_FILE run --rm certbot renew"
echo ""
