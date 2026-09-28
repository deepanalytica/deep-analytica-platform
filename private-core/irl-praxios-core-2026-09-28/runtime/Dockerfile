FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S praxios && adduser -S praxios -G praxios

COPY runtime/ ./

RUN mkdir -p /app/.praxios-data && chown -R praxios:praxios /app

USER praxios

ENV HOST=0.0.0.0
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node","server.mjs"]
