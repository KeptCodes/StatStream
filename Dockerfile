# Base image for development
FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

# Copy package files early to leverage caching
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Stage: Run tests
FROM base AS test
COPY . .
RUN cp .env.example .env
RUN bun run test

# Stage: Build application
FROM base AS build
COPY . .
RUN bun run build

# Final image for production
FROM oven/bun:alpine AS release
WORKDIR /usr/src/app

# Copy production dependencies and build output from the build stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/package.json ./package.json

# Use non-root user for security
USER bun

# Expose application port
EXPOSE 3000

# Start the application using Bun
ENTRYPOINT ["bun", "build/main.js"]
