# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and install dependencies
COPY package*.json ./
RUN pnpm install

# Copy configuration files first
COPY postcss.config.js tailwind.config.js vite.config.ts tsconfig.json ./

# Copy the rest of the application code
COPY . .

# Create a .env file with environment variables - use relative path for API
RUN echo "VITE_API_URL=/api" > .env

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
