// db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Connexion à la base de données
const connection = await mysql.createConnection(process.env.DATABASE_URL!);

// Initialisation de Drizzle ORM
export const db = drizzle(connection, { schema, mode: 'default' });

