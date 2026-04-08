# Use Node 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy package files for apps and packages
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN cd packages/database && npx prisma generate

# Build the app (optional if running in dev mode)
# RUN cd apps/web && npm run build

# Expose the app port
EXPOSE 3000

# Start the application in dev mode
CMD ["npm", "run", "dev"]
