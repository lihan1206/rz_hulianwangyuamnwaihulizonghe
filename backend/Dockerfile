FROM node:20-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

RUN mkdir -p /app/uploads

EXPOSE 3001

CMD ["sh", "-c", "npx prisma generate && npx prisma db push && node prisma/seed.js && node src/server.js"]
