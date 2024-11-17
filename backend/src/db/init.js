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
        { id: 'dev', name: '研发导航', icon: 'HiOutlineCode', sort_order: 1 },
        { id: 'client', name: '客户导航', icon: 'HiOutlineUsers', sort_order: 2 },
        { id: 'standard', name: '标版客户', icon: 'HiOutlineTemplate', sort_order: 3 },
        { id: 'prod', name: '正式环境', icon: 'HiOutlineGlobe', sort_order: 4 },
        { id: 'independent', name: '独立版本客户', icon: 'HiOutlineCube', sort_order: 5 }
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
            id: 'confluence',
            title: 'Confluence',
            subtitle: '知识管理平台',
            url: 'https://confluence.company.com',
            icon: 'HiOutlineBookOpen',
            group_id: 'dev'
        },
        {
            id: 'jira',
            title: 'Jira',
            subtitle: '项目管理工具',
            url: 'https://jira.company.com',
            icon: 'HiOutlineBriefcase',
            group_id: 'dev'
        },
        {
            id: 'client1',
            title: '客户1',
            subtitle: '客户1的详细信息',
            url: 'https://client1.company.com',
            icon: 'HiOutlineUsers',
            group_id: 'client'
        },
        {
            id: 'client2',
            title: '客户2',
            subtitle: '客户2的详细信息',
            url: 'https://client2.company.com',
            icon: 'HiOutlineUsers',
            group_id: 'client'
        },
        {
            id: 'client3',
            title: '客户3',
            subtitle: '客户3的详细信息',
            url: 'https://client3.company.com',
            icon: 'HiOutlineUsers',
            group_id: 'client'
        },
        {
            id: 'client4',
            title: '客户4',
            subtitle: '客户4的详细信息',
            url: 'https://client4.company.com',
            icon: 'HiOutlineUsers',
            group_id: 'client'
        },
        {
            id: 'standard1',
            title: '标准客户1',
            subtitle: '标准客户1的详细信息',
            url: 'https://standard1.company.com',
            icon: 'HiOutlineTemplate',
            group_id: 'standard'
        },
        {
            id: 'standard2',
            title: '标准客户2',
            subtitle: '标准客户2的详细信息',
            url: 'https://standard2.company.com',
            icon: 'HiOutlineTemplate',
            group_id: 'standard'
        },
        {
            id: 'standard3',
            title: '标准客户3',
            subtitle: '标准客户3的详细信息',
            url: 'https://standard3.company.com',
            icon: 'HiOutlineTemplate',
            group_id: 'standard'
        },
        {
            id: 'standard4',
            title: '标准客户4',
            subtitle: '标准客户4的详细信息',
            url: 'https://standard4.company.com',
            icon: 'HiOutlineTemplate',
            group_id: 'standard'
        },
        {
            id: 'prod1',
            title: '生产环境1',
            subtitle: '生产环境1的详细信息',
            url: 'https://prod1.company.com',
            icon: 'HiOutlineGlobe',
            group_id: 'prod'
        },
        {
            id: 'prod2',
            title: '生产环境2',
            subtitle: '生产环境2的详细信息',
            url: 'https://prod2.company.com',
            icon: 'HiOutlineGlobe',
            group_id: 'prod'
        },
        {
            id: 'prod3',
            title: '生产环境3',
            subtitle: '生产环境3的详细信息',
            url: 'https://prod3.company.com',
            icon: 'HiOutlineGlobe',
            group_id: 'prod'
        },
        {
            id: 'prod4',
            title: '生产环境4',
            subtitle: '生产环境4的详细信息',
            url: 'https://prod4.company.com',
            icon: 'HiOutlineGlobe',
            group_id: 'prod'
        },
        {
            id: 'independent1',
            title: '独立版本客户1',
            subtitle: '独立版本客户1的详细信息',
            url: 'https://independent1.company.com',
            icon: 'HiOutlineCube',
            group_id: 'independent'
        },
        {
            id: 'independent2',
            title: '独立版本客户2',
            subtitle: '独立版本客户2的详细信息',
            url: 'https://independent2.company.com',
            icon: 'HiOutlineCube',
            group_id: 'independent'
        },
        {
            id: 'independent3',
            title: '独立版本客户3',
            subtitle: '独立版本客户3的详细信息',
            url: 'https://independent3.company.com',
            icon: 'HiOutlineCube',
            group_id: 'independent'
        },
        {
            id: 'independent4',
            title: '独立版本客户4',
            subtitle: '独立版本客户4的详细信息',
            url: 'https://independent4.company.com',
            icon: 'HiOutlineCube',
            group_id: 'independent'
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

    // Insert additional groups
    const additionalGroups = [
        { id: 'hr', name: '人力资源', icon: 'HiOutlineUserGroup', sort_order: 5 },
        { id: 'finance', name: '财务', icon: 'HiOutlineCash', sort_order: 8 },
        { id: 'marketing', name: '市场', icon: 'HiOutlineChartBar', sort_order: 9 }
    ];

    for (const group of additionalGroups) {
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

    // Insert additional links
    const additionalLinks = [
        {
            id: 'hr-system',
            title: 'HR系统',
            subtitle: '人力资源管理系统',
            url: 'https://hr.company.com',
            icon: 'HiOutlineUserGroup',
            group_id: 'hr'
        },
        {
            id: 'finance-system',
            title: '财务系统',
            subtitle: '财务管理平台',
            url: 'https://finance.company.com',
            icon: 'HiOutlineCash',
            group_id: 'finance'
        },
        {
            id: 'marketing-tools',
            title: '营销工具',
            subtitle: '市场推广工具',
            url: 'https://marketing.company.com',
            icon: 'HiOutlineChartBar',
            group_id: 'marketing'
        },
        {
            id: 'confluence',
            title: 'Confluence',
            subtitle: '知识管理平台',
            url: 'https://confluence.company.com',
            icon: 'HiOutlineBookOpen',
            group_id: 'dev'
        },
        {
            id: 'jira',
            title: 'Jira',
            subtitle: '项目管理工具',
            url: 'https://jira.company.com',
            icon: 'HiOutlineBriefcase',
            group_id: 'dev'
        }
    ];

    for (const link of additionalLinks) {
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
