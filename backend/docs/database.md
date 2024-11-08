# 数据库设计文档

## 目录

- [数据库配置](#数据库配置)
- [表结构设计](#表结构设计)
- [SQL语句参考](#sql语句参考)
- [数据库适配器](#数据库适配器)

## 数据库配置

系统支持 SQLite 和 MySQL 两种数据库：

```env
# 数据库类型选择
DB_TYPE=sqlite  # 或 mysql

# SQLite 配置
DB_NAME=database.sqlite

# MySQL 配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=nav_portal
```

## 表结构设计

### users 表
用户信息表，存储用户账号信息。

```sql
-- SQLite
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

-- MySQL
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  wework_userid VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### groups 表
分组表，存储导航分组信息。

```sql
-- SQLite
CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- MySQL
CREATE TABLE `groups` (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### subgroups 表
二级分组表，存储导航子分组信息。

```sql
-- SQLite
CREATE TABLE subgroups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- MySQL
CREATE TABLE subgroups (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  group_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### links 表
链接表，存储导航链接信息。

```sql
-- SQLite
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

-- MySQL
CREATE TABLE links (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(255) NOT NULL,
  group_id VARCHAR(255) NOT NULL,
  subgroup_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## SQL语句参考

### 用户管理

```sql
-- 创建用户
INSERT INTO users (username, email, password, verification_token) 
VALUES (?, ?, ?, ?);

-- 查询用户
SELECT * FROM users WHERE username = ? OR email = ?;

-- 验证用户
UPDATE users SET is_active = TRUE, verification_token = NULL WHERE id = ?;

-- 更新用户
UPDATE users SET username = ?, email = ? WHERE id = ?;
```

### 分组管理

```sql
-- 创建分组
INSERT INTO groups (id, name, icon) VALUES (?, ?, ?);

-- 查询所有分组
SELECT * FROM groups;

-- 更新分组
UPDATE groups SET name = ?, icon = ? WHERE id = ?;

-- 删除分组
DELETE FROM groups WHERE id = ?;
```

### 子分组管理

```sql
-- 创建子分组
INSERT INTO subgroups (id, name, group_id) VALUES (?, ?, ?);

-- 查询分组的子分组
SELECT * FROM subgroups WHERE group_id = ?;

-- 更新子分组
UPDATE subgroups SET name = ? WHERE id = ?;

-- 删除子分组
DELETE FROM subgroups WHERE id = ?;
```

### 链接管理

```sql
-- 创建链接
INSERT INTO links (id, title, subtitle, url, icon, group_id, subgroup_id) 
VALUES (?, ?, ?, ?, ?, ?, ?);

-- 查询所有链接
SELECT * FROM links;

-- 查询分组链接
SELECT * FROM links WHERE group_id = ?;

-- 查询子分组链接
SELECT * FROM links WHERE group_id = ? AND subgroup_id = ?;

-- 更新链接
UPDATE links 
SET title = ?, subtitle = ?, url = ?, icon = ?, group_id = ?, subgroup_id = ? 
WHERE id = ?;

-- 删除链接
DELETE FROM links WHERE id = ?;
```

## 数据库适配器

系统使用统一的数据库适配器接口进行数据操作：

```javascript
// 查询单条记录
const user = await dbAdapter.queryOne(queries.findUserByUsername, [username]);

// 查询多条记录
const groups = await dbAdapter.queryAll(queries.getAllGroups);

// 执行更新操作
await dbAdapter.execute(queries.createUser, [username, email, password, token]);
```

### SQLite 时间戳触发器

```sql
-- 用户表更新触发器
CREATE TRIGGER update_users_modified_at 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 分组表更新触发器
CREATE TRIGGER update_groups_modified_at 
AFTER UPDATE ON groups
BEGIN
  UPDATE groups SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 子分组表更新触发器
CREATE TRIGGER update_subgroups_modified_at 
AFTER UPDATE ON subgroups
BEGIN
  UPDATE subgroups SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 链接表更新触发器
CREATE TRIGGER update_links_modified_at 
AFTER UPDATE ON links
BEGIN
  UPDATE links SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```