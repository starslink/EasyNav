FROM crpi-azx8qz94819u1c2x.cn-guangzhou.personal.cr.aliyuncs.com/kevin_namespace/node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --registry=https://registry.npmmirror.com

COPY . .

# Add healthcheck endpoint
RUN echo 'app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));' >> src/index.js

EXPOSE 3000
CMD ["node", "src/index.js"]
