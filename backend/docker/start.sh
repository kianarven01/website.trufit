#!/bin/bash

# Ensure storage and cache have correct permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Clear old caches to ensure new Env variables (like RESEND_API_KEY) are picked up
php artisan config:clear
php artisan cache:clear

# Run migrations
php artisan migrate --force

# Start the queue worker
php artisan queue:work --sleep=3 --tries=3 --timeout=90 &

# Start Apache
echo "Starting Apache..."
apache2-foreground
