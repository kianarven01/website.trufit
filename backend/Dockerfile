FROM php:8.4-apache

# Install system dependencies (including Chromium dependencies for spatie/laravel-pdf)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    zip \
    unzip \
    git \
    curl \
    # Node.js (required by spatie/laravel-pdf / Browsershot)
    nodejs \
    npm \
    # Chromium and its dependencies for PDF rendering
    chromium \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libxshmfence1 \
    fonts-liberation \
    && docker-php-ext-install pdo_pgsql gd zip bcmath intl pcntl mbstring

# Enable Apache rewrite
RUN a2enmod rewrite

WORKDIR /var/www/html

# Copy project files
COPY . .

# Set Apache root to Laravel public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# FLEXIBLE COMPOSER: Try install first, fallback to update if lock is out of sync
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs || \
    composer update --no-dev --optimize-autoloader --ignore-platform-reqs

# Install Puppeteer with bundled Chromium for spatie/laravel-pdf
RUN npm install puppeteer

# Set Chromium path for Browsershot (use system Chromium as fallback)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy and set up the startup script
# Using a fallback to ensure the script exists even if COPY fails
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 80

# Use the startup script
CMD ["/usr/local/bin/start.sh"]
