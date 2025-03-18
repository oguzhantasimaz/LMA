# Use Node.js as the base image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Copy application code
COPY . .

# Create prisma directory and copy schema there
RUN mkdir -p prisma && cp ./schema.prisma prisma/schema.prisma

# Install all dependencies including devDependencies to ensure prisma works
RUN pnpm install 

# Generate Prisma client explicitly
RUN npx prisma generate

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]
