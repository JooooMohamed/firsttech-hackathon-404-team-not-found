FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo config
COPY package.json pnpm-workspace.yaml .npmrc ./

# Copy package.json files for all workspace packages
COPY server/package.json ./server/
COPY packages/shared/package.json ./packages/shared/

# Install pnpm and dependencies
RUN npm install -g pnpm@8 && pnpm install --frozen-lockfile || pnpm install

# Copy shared package source
COPY packages/shared ./packages/shared

# Copy server source and build
COPY server ./server
RUN cd server && npx nest build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server/dist/main.js"]
