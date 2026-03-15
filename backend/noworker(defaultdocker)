FROM php:8.4-apache

# 1. Install system dependencies (including git, zip, and unzip)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo_pgsql gd zip

# 2. Enable Apache mod_rewrite
RUN a2enmod rewrite

# 3. Set working directory
WORKDIR /var/www/html

# 4. Copy backend files
COPY . .

# 5. Set Apache root to Laravel's public folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

# 6. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 7. Install dependencies (Added --ignore-platform-reqs for safety)
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# 8. Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80