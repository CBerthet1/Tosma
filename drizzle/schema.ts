import { datetime, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

export const resaTable = mysqlTable('resa_table', {
  id: serial("id").primaryKey(), // Primary key signifie que la propriété est unique pour chaque élément
  name: varchar("name",{ length: 255 }).notNull(), // notNull pour empêcher les cases vides 
  start: datetime('start').notNull(),
  end:datetime('end').notNull(),
});

export const matosTable = mysqlTable('matos_table', {
  id: serial("id").primaryKey(), // Primary key signifie que la propriété est unique pour chaque élément
  name: varchar("name",{ length: 255 }).notNull(), // notNull pour empêcher les cases vides 
});