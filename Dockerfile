FROM php:8.3-cli

WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer