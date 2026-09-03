FROM node:20-bullseye-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl libssl-dev && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY prisma ./prisma/
RUN npx prisma generate
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src/
RUN npx tsc --project tsconfig.build.json

FROM node:20-bullseye-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma/
COPY startup.js ./
COPY prisma/seed-plain.js ./prisma/seed-plain.js
EXPOSE 3000
CMD ["node", "startup.js"]
