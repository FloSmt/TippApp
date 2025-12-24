# 1. Base Stage
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx nx run backend:build

# 2. Development Stage
FROM base AS development
RUN npm install
COPY . .
# Start the development server with hot-reloading
CMD ["npx", "nx", "run", "backend:serve:development"]

# 3. Build Stage
FROM development AS builder
RUN npm run build
RUN npm prune --production

# 4. Production Stage
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/backend ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
