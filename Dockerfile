# Base 이미지 설정
FROM oven/bun:1.1.29 AS base

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 및 종속성 복사
COPY bun.lockb package.json ./
RUN bun install --frozen-lockfile

# 개발 및 빌드 스테이지 분리
FROM base AS dev
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]

FROM base AS builder
COPY . .
RUN bun run build

FROM base AS prod
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY package.json .

EXPOSE 3001
CMD ["bun", "run", "start"]