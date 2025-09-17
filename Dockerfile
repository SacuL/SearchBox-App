# Use the official Node.js 18 image as the base image
FROM node:18-bullseye-slim

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    cmake \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if available)
COPY package.json pnpm-lock.yaml* ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Manually install and build faiss-node to ensure proper compilation
RUN cd /tmp && \
    npm install faiss-node@0.5.1 && \
    cd node_modules/faiss-node && \
    npm run build || npm run install || true && \
    cp -r . /app/node_modules/.pnpm/faiss-node@0.5.1/node_modules/faiss-node/

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build

# Expose the port that the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create a non-root user for security
RUN groupadd -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs nextjs

RUN chown nextjs:nodejs /app
USER nextjs

# Start the application
CMD ["pnpm", "start"]
