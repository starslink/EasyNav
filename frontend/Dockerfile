FROM crpi-azx8qz94819u1c2x.cn-guangzhou.personal.cr.aliyuncs.com/kevin_namespace/node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --registry=https://registry.npmmirror.com

COPY . .
RUN npm run build

FROM crpi-azx8qz94819u1c2x.cn-guangzhou.personal.cr.aliyuncs.com/kevin_namespace/nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
