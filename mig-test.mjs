import 'dotenv/config';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn);

try {
  await migrate(db, { migrationsFolder: './src/drizzle' });
  console.log('MIGRATIONS OK');
} catch (e) {
  console.error('MESSAGE:', e.message);
  console.error('SQL:', e.sql);
  console.error('SQLSTATE:', e.sqlState);
}
await conn.end();
