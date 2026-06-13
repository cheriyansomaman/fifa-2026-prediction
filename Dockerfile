FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
COPY src/ ../src/
CMD ["node_modules/.bin/tsx", "src/index.ts"]
