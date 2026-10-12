import {
  datetime,
  int,
  json,
  mysqlTable,
  text,
  tinyint,
  varchar,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export type ReservationMaterial = {
  matosId: number;
  quantity: number;
};

export const resaTable = mysqlTable('resa', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 63 }),
  start: datetime('start').notNull().default(sql`CURRENT_TIMESTAMP`),
  end: datetime('end').notNull().default(sql`CURRENT_TIMESTAMP`),
  user: varchar('user', { length: 63 }),
  matos: json('matos').$type<ReservationMaterial[]>().notNull(),
});

export const matosTable = mysqlTable('materiel', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }),
  description: text('description'),
  available: tinyint('available').notNull().default(1),
  categorie: varchar('categorie', { length: 255 }).notNull(),
  image: varchar('image', { length: 255 }),
  addedDate: datetime('added_date').notNull().default(sql`CURRENT_TIMESTAMP`),
  quantity: int('quantity').notNull().default(1),
});
