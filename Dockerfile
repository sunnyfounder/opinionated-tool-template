FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# data/ and logs/ are bind-mounted at runtime — these just ensure the
# directories exist inside the image if the mount is missing.
RUN mkdir -p data logs

EXPOSE 3000

# Run tsx directly so SIGTERM is delivered to the Node process, not an
# npm wrapper. The tool's shutdown handler (SIGTERM → graceful close)
# depends on this.
CMD ["node_modules/.bin/tsx", "src/index.ts"]
