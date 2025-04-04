FROM php:8.2-cli

# Optional: Install PHP extensions or system packages
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip

# Copy the app files into the container
COPY . /app
WORKDIR /app

# Define the port Render expects (default is 10000)
ENV PORT 10000

# Start PHP built-in web server for the 'phpserver' folder
CMD ["php", "-S", "0.0.0.0:10000", "-t", "phpserver/"]
