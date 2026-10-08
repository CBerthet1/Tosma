import {
  datetime,
  int,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const categoryTable = mysqlTable(
  'category',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex('category_name_unique').on(table.name),
  }),
);

export const resaTable = mysqlTable('resa', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 63 }),
  start: datetime('start').notNull().default(sql`CURRENT_TIMESTAMP`),
  end: datetime('end').notNull().default(sql`CURRENT_TIMESTAMP`),
  user: varchar('user', { length: 63 }),
});

export const matosTable = mysqlTable('materiel', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }),
  description: text('description'),
  available: tinyint('available').notNull().default(1),
  categoryId: int('category_id').notNull().default(1),
  addedDate: datetime('added_date').notNull().default(sql`CURRENT_TIMESTAMP`),
  quantity: int('quantity').notNull().default(1),
});

export const resaMatosTable = mysqlTable(
  'resa_matos',
  {
    resaId: int('id_resa').notNull(),
    matosId: int('id_matos').notNull(),
    n: int('n').autoincrement().primaryKey(),
    quantity: int('quantity').notNull().default(1),
  },
);

export const sessionTable = mysqlTable('session', {
  id: varchar('id', { length: 63 }).primaryKey(),
  user: varchar('user', { length: 63 }).notNull(),
  expires: timestamp('expires'),
});

export const imageTable = mysqlTable('image', {
  id: int('id').autoincrement().primaryKey(),
  itemId: int('item_id').notNull(),
  url: varchar('url', { length: 255 }).notNull(),
});
