import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import {dbConfig} from './config.js';

let db;

async function createSqliteConnection() {
    return await open({
        filename: dbConfig.sqlite.filename,
        driver: sqlite3.Database
    });
}

async function createMysqlConnection() {
    return mysql.createPool({
        ...dbConfig.mysql,
        multipleStatements: true
    });
}

export async function getDb() {
    if (!db) {
        if (dbConfig.type === 'mysql') {
            db = await createMysqlConnection();
        } else {
            db = await createSqliteConnection();
        }
    }
    return db;
}

const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
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

  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    sort_order INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sort_order)
  );

  CREATE TABLE IF NOT EXISTS subgroups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    group_id TEXT NOT NULL,
    sort_order INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, sort_order)
  );

  CREATE TABLE IF NOT EXISTS links (
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

  CREATE TRIGGER IF NOT EXISTS update_users_modified_at 
  AFTER UPDATE ON users
  BEGIN
    UPDATE users SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS update_groups_modified_at 
  AFTER UPDATE ON groups
  BEGIN
    UPDATE groups SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS update_subgroups_modified_at 
  AFTER UPDATE ON subgroups
  BEGIN
    UPDATE subgroups SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS update_links_modified_at 
  AFTER UPDATE ON links
  BEGIN
    UPDATE links SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`;

const MYSQL_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
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

  CREATE TABLE IF NOT EXISTS \`groups\` (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_sort_order (sort_order)
  );

  CREATE TABLE IF NOT EXISTS subgroups (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    group_id VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_group_sort_order (group_id, sort_order)
  );

  CREATE TABLE IF NOT EXISTS links (
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
`;

const DEFAULT_DATA = {
    admin: {
        username: 'admin',
        email: 'admin@company.com',
        password: bcrypt.hashSync('admin123', 10),
        is_active: true
    },
    groups: [
        {id: 'dev', name: '研发导航', icon: 'HiOutlineCode', sort_order: 1},
        {id: 'client', name: '客户导航', icon: 'HiOutlineUsers', sort_order: 2},
        {id: 'standard', name: '标版客户', icon: 'HiOutlineTemplate', sort_order: 3},
        {id: 'prod', name: '正式环境', icon: 'HiOutlineGlobe', sort_order: 4},
        {id: 'independent', name: '独立版本客户', icon: 'HiOutlineCube', sort_order: 6},
        {id: 'test', name: '客户测试环境', icon: 'HiOutlineBeaker', sort_order: 7}
    ],
    links: [
        {
            id: 'gitlab',
            title: 'GitLab',
            subtitle: '代码仓库管理平台',
            url: 'https://gitlab.company.com',
            icon: 'HiOutlineCode',
            group_id: 'dev'
        },
        {
            id: 'jenkins',
            title: 'Jenkins',
            subtitle: '持续集成服务',
            url: 'https://jenkins.company.com',
            icon: 'HiOutlineServer',
            group_id: 'dev'
        },
        {
            id: 'ceshi1',
            title: 'ceshi1',
            subtitle: 'ceshi1',
            url: 'https://jenkins.company.com',
            icon: 'HiOutlineServer',
            group_id: 'dev'
        },
        {
            id: 'ceshi2',
            title: 'ceshi2',
            subtitle: 'ceshi2',
            url: 'https://jenkins.company.com',
            icon: 'HiOutlineServer',
            group_id: 'dev'
        },
        {
            id: 'ceshi3',
            title: 'ceshi3',
            subtitle: 'ceshi3',
            url: 'https://jenkins.company.com',
            icon: 'HiOutlineServer',
            group_id: 'dev'
        },
        {
            id: 'ceshi4',
            title: 'ceshi4',
            subtitle: 'ceshi4',
            url: 'https://jenkins.company.com',
            icon: 'HiOutlineServer',
            group_id: 'dev'
        },
        {
            id: 'ceshi5',
            title: 'ceshi5',
            subtitle: 'ceshi5',
            url: 'https://jenkins.company.com',
            icon: 'HiOutlineServer',
            group_id: 'dev'
        },
        {
            id: 'ceshi6',
            title: 'ceshi6',
            subtitle: 'ceshi6',
            url: 'https://jenkins.company.com',
            icon: 'HiOutlineServer',
            group_id: 'dev'
        },
        {
            id: 'ceshi7',
            title: 'ceshi7',
            subtitle: 'ceshi7',
            url: 'https://jenkins.company.com',
            icon: 'HiOutlineServer',
            group_id: 'dev'
        }
    ]
};

async function initializeSqlite(db) {
    await db.exec(SQLITE_SCHEMA);

    // Insert default admin user
    await db.run(
        'INSERT OR IGNORE INTO users (username, email, password, is_active) VALUES (?, ?, ?, ?)',
        [DEFAULT_DATA.admin.username, DEFAULT_DATA.admin.email, DEFAULT_DATA.admin.password, DEFAULT_DATA.admin.is_active]
    );

    // Insert default groups
    for (const group of DEFAULT_DATA.groups) {
        await db.run(
            'INSERT OR IGNORE INTO groups (id, name, icon, sort_order) VALUES (?, ?, ?, ?)',
            [group.id, group.name, group.icon, group.sort_order]
        );
    }

    // Insert default links
    for (const link of DEFAULT_DATA.links) {
        await db.run(
            'INSERT OR IGNORE INTO links (id, title, subtitle, url, icon, group_id) VALUES (?, ?, ?, ?, ?, ?)',
            [link.id, link.title, link.subtitle, link.url, link.icon, link.group_id]
        );
    }

    // Insert A-Z subgroups
    const azSubgroups = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, index) => ({
        id: `az-${letter.toLowerCase()}`,
        name: letter,
        group_id: 'az',
        sort_order: index + 1
    }));

    for (const subgroup of azSubgroups) {
        await db.run(
            'INSERT OR IGNORE INTO subgroups (id, name, group_id, sort_order) VALUES (?, ?, ?, ?)',
            [subgroup.id, subgroup.name, subgroup.group_id, subgroup.sort_order]
        );
    }
}

async function initializeMysql(db) {
    await db.query(MYSQL_SCHEMA);

    // Insert default admin user
    await db.query(
        'INSERT IGNORE INTO users (username, email, password, is_active) VALUES (?, ?, ?, ?)',
        [DEFAULT_DATA.admin.username, DEFAULT_DATA.admin.email, DEFAULT_DATA.admin.password, DEFAULT_DATA.admin.is_active]
    );

    // Insert default groups
    for (const group of DEFAULT_DATA.groups) {
        await db.query(
            'INSERT IGNORE INTO `groups` (id, name, icon) VALUES (?, ?, ?)',
            [group.id, group.name, group.icon]
        );
    }

    // Insert default links
    for (const link of DEFAULT_DATA.links) {
        await db.query(
            'INSERT IGNORE INTO links (id, title, subtitle, url, icon, group_id) VALUES (?, ?, ?, ?, ?, ?)',
            [link.id, link.title, link.subtitle, link.url, link.icon, link.group_id]
        );
    }

    // Insert A-Z subgroups
    const azSubgroups = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
        id: `az-${letter.toLowerCase()}`,
        name: letter,
        group_id: 'az'
    }));

    for (const subgroup of azSubgroups) {
        await db.query(
            'INSERT IGNORE INTO subgroups (id, name, group_id) VALUES (?, ?, ?)',
            [subgroup.id, subgroup.name, subgroup.group_id]
        );
    }
}

export async function initializeDatabase() {
    try {
        const db = await getDb();

        if (dbConfig.type === 'mysql') {
            await initializeMysql(db);
        } else {
            await initializeSqlite(db);
        }

        console.log(`Database (${dbConfig.type}) initialized successfully`);
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}
