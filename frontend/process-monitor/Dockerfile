FROM node:22-alpine AS deps
WORKDIR /app
COPY frontend/process-monitor/package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/process-monitor ./
ARG PROCESS_MONITOR_API_ORIGIN=http://backend:8000
ENV PROCESS_MONITOR_API_ORIGIN=${PROCESS_MONITOR_API_ORIGIN}
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    PROCESS_MONITOR_API_ORIGIN=http://backend:8000

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
