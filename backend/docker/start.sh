#!/bin/bash

# Ensure storage and cache have correct permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Run migrations (Render doesn't have a separate migration step by default)
php artisan migrate --force

# Start the queue worker in the background
# We use --daemon (implicit in newer Laravel) to run continuously
php artisan queue:work --sleep=3 --tries=3 --timeout=90 &

# Start Apache in the foreground
apache2-foreground
