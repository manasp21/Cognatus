FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

FROM node:22-alpine AS release

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

ENTRYPOINT ["node", "dist/index.js"]
