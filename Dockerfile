FROM node:22-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
COPY prisma.config.ts ./
COPY backend/prisma ./backend/prisma
RUN npm ci

# Copy source
COPY . .

RUN npm run prisma:generate
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "backend/dist/nest/main.js"]
