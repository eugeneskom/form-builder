FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM base AS build
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
