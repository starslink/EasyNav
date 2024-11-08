# 公司导航门户

一个现代化的企业内部导航门户系统，用于集中管理和展示公司各类系统和资源的链接。

## 功能特点

- 🔐 用户认证与授权
    - 邮箱注册与验证
    - JWT token 认证
    - 管理员权限控制

- 📱 响应式设计
    - 支持桌面和移动设备
    - 流畅的动画效果
    - 现代化的 UI/UX

- 🎯 导航管理
    - 分组管理
    - 二级分类
    - 链接排序
    - 灵活的搜索功能

- 🛠 管理功能
    - 分组 CRUD
    - 链接 CRUD
    - 二级分类管理
    - 排序管理

## 技术栈

### 前端

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- React Icons
- Axios
- React Router

### 后端

- Node.js
- Express
- SQLite/MySQL
- JWT
- Nodemailer
- bcrypt

### 部署

- Docker
- Kubernetes
- Nginx

## 项目结构

```
.
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── db/             # 数据库相关
│   │   ├── middleware/     # 中间件
│   │   ├── routes/        # 路由
│   │   └── utils/         # 工具函数
│   └── docs/              # 文档
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── services/     # API 服务
│   │   └── types/        # TypeScript 类型
└── k8s/                   # Kubernetes 配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- MySQL (可选，默认使用 SQLite)

### 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

### 环境配置

1. 后端配置 (backend/.env)

```env
PORT=3000
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=Company Portal <noreply@company.com>
FRONTEND_URL=http://localhost:5173

# 数据库配置
DB_TYPE=sqlite  # 或 mysql
DB_NAME=database.sqlite
# MySQL 配置（如果使用 MySQL）
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
```

2. 前端配置 (frontend/.env)

```env
VITE_API_URL=http://localhost:3000/api
```

### 启动开发服务器

```bash
# 后端
cd backend
npm run dev

# 前端
cd frontend
npm run dev
```

## 部署

### Docker 部署

1. 构建镜像

```bash
# 后端
docker build -t nav-portal-backend ./backend

# 前端
docker build -t nav-portal-frontend ./frontend
```

2. 使用 Docker Compose 启动

```yaml
version: '3'
services:
  frontend:
    image: nav-portal-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:3000/api

  backend:
    image: nav-portal-backend
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=your-secret-key
      - DB_TYPE=mysql
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=root
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=nav_portal
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

### Kubernetes 部署

项目包含完整的 Kubernetes 配置文件，位于 `k8s/` 目录：

- `frontend.yaml`
- `backend.yaml`
- `mysql-deployment.yaml 已经删除(需要自己安装数据库信息)`
- `ingress.yaml(或者traefik.yaml)`

使用 kubectl 部署：

```bash
kubectl apply -f k8s/
```

## 数据库设计

### users 表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  wework_userid TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### groups 表
```sql
CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### subgroups 表
```sql
CREATE TABLE subgroups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  sort_order INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### links 表
```sql
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  group_id TEXT NOT NULL,
  subgroup_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API 文档

### 认证相关

#### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### 验证邮箱
```
GET /api/auth/verify-email?token=string
```

### 分组管理

#### 获取所有分组
```
GET /api/groups
Authorization: Bearer <token>
```

#### 创建分组
```
POST /api/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "string",
  "name": "string",
  "icon": "string",
  "sort_order": number
}
```

#### 更新分组
```
PUT /api/groups/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "icon": "string",
  "sort_order": number
}
```

#### 删除分组
```
DELETE /api/groups/:id
Authorization: Bearer <token>
```

### 链接管理

#### 获取所有链接
```
GET /api/links
Authorization: Bearer <token>
```

#### 获取分组链接
```
GET /api/links/group/:groupId
Authorization: Bearer <token>
```

#### 创建链接
```
POST /api/links
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "string",
  "title": "string",
  "subtitle": "string",
  "url": "string",
  "icon": "string",
  "group_id": "string",
  "subgroup_id": "string"
}
```

#### 更新链接
```
PUT /api/links/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "subtitle": "string",
  "url": "string",
  "icon": "string",
  "group_id": "string",
  "subgroup_id": "string"
}
```

#### 删除链接
```
DELETE /api/links/:id
Authorization: Bearer <token>
```

## 安全性

- 密码加密：使用 bcrypt 进行密码哈希
- JWT 认证：使用 JWT 进行用户认证
- CORS 保护：配置适当的 CORS 策略
- 环境变量：敏感信息通过环境变量配置
- SQL 注入防护：使用参数化查询
- XSS 防护：React 默认转义 + CSP
- 邮箱验证：新用户需要验证邮箱

## 性能优化

### 前端
- 路由懒加载
- 组件按需加载
- 图片懒加载
- 缓存静态资源
- Gzip 压缩
- Tree Shaking
- 代码分割

### 后端
- 数据库索引
- 连接池
- 缓存策略
- 请求限流
- 响应压缩

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 推送到分支
5. 创建 Pull Request

## 许可证

木兰宽松许可证
