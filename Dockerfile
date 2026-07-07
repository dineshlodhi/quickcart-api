# ─── Stage 1: Builder ───────────────────────────────────────────────
# This stage installs ALL dependencies (including dev tools like TypeScript)
# and compiles the application into JavaScript.
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first.
# This allows Docker to cache the 'npm ci' layer unless package files change.
COPY package*.json ./

# Install all dependencies (including devDependencies required for build)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript (outputs to dist/ folder)
RUN npm run build

# ─── Stage 2: Production ────────────────────────────────────────────
# This stage creates the final, minimal image that goes to production.
# It leaves behind TypeScript, source files, and dev tools.
FROM node:20-alpine AS production

# Set NODE_ENV to production. This optimizes Node.js performance
# and tells npm to only install production dependencies.
ENV NODE_ENV=production

# Switch from the default root user to the less privileged 'node' user
# provided by the official Node.js image for better security.
USER node

WORKDIR /app

# Copy package files and install ONLY production dependencies.
# The --chown flag ensures the 'node' user owns these files.
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Copy only the compiled JavaScript from the builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

# Document that the container listens on port 3000
EXPOSE 3000

# Define the command to start the application
CMD ["node", "dist/server.js"]
