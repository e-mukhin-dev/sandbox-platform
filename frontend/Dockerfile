FROM node:24-bookworm-slim

WORKDIR /app

RUN npm install --global pnpm@12.3.4

EXPOSE 3000

CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm dev --hostname 0.0.0.0"]