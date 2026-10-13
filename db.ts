// db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// Connexion à la base de données
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

export const db = drizzle(poolConnection);


