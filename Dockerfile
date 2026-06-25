FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
COPY src/ ../src/
USER appuser
CMD ["node_modules/.bin/tsx", "src/index.ts"]
