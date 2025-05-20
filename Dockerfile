FROM oven/bun:alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "bun.lock", "./"]
RUN bun install --production --frozen-lockfile && mv node_modules ../
COPY . .
EXPOSE 3001
RUN chown -R bun /usr/src/app
USER bun
CMD ["bun", "start"]
