# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Backend & Runner
FROM node:18-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source code & Prisma schema
COPY backend/ ./
RUN npx prisma generate

# Copy built frontend assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port & environment
EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

# Run DB sync, seed check, and launch Express server on container startup
CMD ["sh", "-c", "npx prisma db push --skip-generate && node prisma/seed.js && node src/app.js"]
