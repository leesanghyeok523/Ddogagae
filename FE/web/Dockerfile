# 1단계: 빌드
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --force
RUN npm run build

# 2단계: 실행용
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
