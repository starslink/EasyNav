import { getDb } from './init.js';
import { dbConfig } from './config.js';

class DatabaseAdapter {
  async query(sql, params = []) {
    const db = await getDb();
    
    if (dbConfig.type === 'mysql') {
      const [rows] = await db.query(sql, params);
      return rows;
    } else {
      if (sql.toLowerCase().startsWith('select')) {
        if (sql.toLowerCase().includes('where')) {
          return await db.get(sql, params);
        }
        return await db.all(sql, params);
      } else {
        return await db.run(sql, params);
      }
    }
  }

  async queryAll(sql, params = []) {
    const db = await getDb();
    
    if (dbConfig.type === 'mysql') {
      const [rows] = await db.query(sql, params);
      return rows;
    } else {
      return await db.all(sql, params);
    }
  }

  async queryOne(sql, params = []) {
    const db = await getDb();
    
    if (dbConfig.type === 'mysql') {
      const [rows] = await db.query(sql, params);
      return rows[0];
    } else {
      return await db.get(sql, params);
    }
  }

  async execute(sql, params = []) {
    const db = await getDb();
    
    if (dbConfig.type === 'mysql') {
      const [result] = await db.query(sql, params);
      return result;
    } else {
      return await db.run(sql, params);
    }
  }
}

export const dbAdapter = new DatabaseAdapter();