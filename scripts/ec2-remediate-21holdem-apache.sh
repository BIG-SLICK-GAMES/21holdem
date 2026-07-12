#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/ec2-remediate-21holdem-apache.sh"
  exit 1
fi

SITE_NAME="21holdem"
PRIMARY_DOMAIN="21-holdem.com"
WWW_DOMAIN="www.21-holdem.com"
API_DOMAIN="api.21-holdem.com"
DOC_ROOT="/var/www/html/game_build/build"
BACKEND_ORIGIN="http://127.0.0.1:3050"
SOCKET_ORIGIN="ws://127.0.0.1:3050"
ADMIN_EMAIL="${CERTBOT_EMAIL:-admin@21-holdem.com}"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
BACKUP_DIR="/root/${SITE_NAME}-apache-backup-${TIMESTAMP}"

echo "Creating Apache config backup at ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"
cp -a /etc/apache2/sites-available "${BACKUP_DIR}/sites-available"
cp -a /etc/apache2/sites-enabled "${BACKUP_DIR}/sites-enabled"

echo "Enabling required Apache modules"
a2enmod rewrite headers proxy proxy_http proxy_wstunnel ssl >/dev/null

echo "Writing HTTP redirect vhost"
cat >"/etc/apache2/sites-available/${SITE_NAME}.conf" <<APACHE_HTTP
<VirtualHost *:80>
    ServerName ${PRIMARY_DOMAIN}
    ServerAlias ${WWW_DOMAIN} ${API_DOMAIN}

    RewriteEngine On
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

    ErrorLog \${APACHE_LOG_DIR}/${SITE_NAME}-error.log
    CustomLog \${APACHE_LOG_DIR}/${SITE_NAME}-access.log combined
</VirtualHost>
APACHE_HTTP

a2ensite "${SITE_NAME}.conf" >/dev/null
apache2ctl configtest
systemctl reload apache2

echo "Issuing/renewing Let's Encrypt certificate for ${PRIMARY_DOMAIN}, ${WWW_DOMAIN}, ${API_DOMAIN}"
certbot certonly --apache \
  --non-interactive \
  --agree-tos \
  --email "${ADMIN_EMAIL}" \
  --expand \
  --cert-name "${PRIMARY_DOMAIN}" \
  -d "${PRIMARY_DOMAIN}" \
  -d "${WWW_DOMAIN}" \
  -d "${API_DOMAIN}"

CERT_DIR="/etc/letsencrypt/live/${PRIMARY_DOMAIN}"
if [[ ! -f "${CERT_DIR}/fullchain.pem" || ! -f "${CERT_DIR}/privkey.pem" ]]; then
  echo "Expected certificate files were not found in ${CERT_DIR}"
  exit 1
fi

echo "Writing hardened HTTPS vhost"
cat >"/etc/apache2/sites-available/${SITE_NAME}-ssl.conf" <<APACHE_SSL
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName ${PRIMARY_DOMAIN}
    ServerAlias ${WWW_DOMAIN} ${API_DOMAIN}

    DocumentRoot ${DOC_ROOT}

    <Directory ${DOC_ROOT}>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    Header always unset X-Powered-By

    ProxyPreserveHost On
    ProxyPass /api/ ${BACKEND_ORIGIN}/api/
    ProxyPassReverse /api/ ${BACKEND_ORIGIN}/api/
    ProxyPass /socket.io/ ${SOCKET_ORIGIN}/socket.io/
    ProxyPassReverse /socket.io/ ${SOCKET_ORIGIN}/socket.io/

    SSLEngine on
    SSLCertificateFile ${CERT_DIR}/fullchain.pem
    SSLCertificateKeyFile ${CERT_DIR}/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    ErrorLog \${APACHE_LOG_DIR}/${SITE_NAME}-ssl-error.log
    CustomLog \${APACHE_LOG_DIR}/${SITE_NAME}-ssl-access.log combined
</VirtualHost>
</IfModule>
APACHE_SSL

a2ensite "${SITE_NAME}-ssl.conf" >/dev/null

echo "Validating Apache configuration"
apache2ctl configtest

echo "Reloading Apache"
systemctl reload apache2

echo "Running smoke checks"
curl -fsSI "https://${PRIMARY_DOMAIN}" >/dev/null
curl -fsSI "https://${WWW_DOMAIN}" >/dev/null
curl -fsSI "https://${API_DOMAIN}" >/dev/null
curl -fsSI "http://${API_DOMAIN}" | grep -qi '^location: https://'
curl -fsS "https://${PRIMARY_DOMAIN}/socket.io/?EIO=4&transport=polling" | head -c 16 >/dev/null

echo "Done. Backup: ${BACKUP_DIR}"
echo "Verify from outside the instance:"
echo "  curl -I https://${API_DOMAIN}"
echo "  curl -I http://${API_DOMAIN}"
