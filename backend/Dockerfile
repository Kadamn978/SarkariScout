FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY prisma ./prisma/
RUN npx prisma generate
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src/
RUN npx tsc --project tsconfig.build.json

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma/
EXPOSE 3000
CMD ["node", "dist/main"]
