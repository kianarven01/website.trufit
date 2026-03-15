#!/bin/bash

# Ensure storage and cache have correct permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Debug: Check if we can reach Gmail at all
echo "Checking network connectivity to Gmail..."
timeout 3 bash -c "cat < /dev/null > /dev/tcp/74.125.142.108/587" && echo "SUCCESS: Gmail port 587 is reachable" || echo "ERROR: Gmail port 587 is UNREACHABLE"

# Run migrations
php artisan migrate --force

# Start the queue worker
php artisan queue:work --sleep=3 --tries=3 --timeout=90 &

# Start Apache
apache2-foreground
