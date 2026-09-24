import { datetime, int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const resaTable = mysqlTable('resa_table', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  start: datetime('start').notNull(),
  end: datetime('end').notNull(),
});

export const matosTable = mysqlTable('matos_table', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

// Table de liaison N:N entre Réservations et Matériel
export const resaMatosTable = mysqlTable('resa_matos_table', {
  id: int('id').autoincrement().primaryKey(),
  resaId: int("resa_id").notNull().references(() => resaTable.id, { onDelete: 'cascade' }),
  matosId: int("matos_id").notNull().references(() => matosTable.id, { onDelete: 'cascade' }),
});

// Configuration des relations pour les requêtes relationnelles (drizzle-orm)
export const resaRelations = relations(resaTable, ({ many }) => ({
  matosItems: many(resaMatosTable),
}));

export const matosRelations = relations(matosTable, ({ many }) => ({
  reservations: many(resaMatosTable),
}));

export const resaMatosRelations = relations(resaMatosTable, ({ one }) => ({
  reservation: one(resaTable, {
    fields: [resaMatosTable.resaId],
    references: [resaTable.id],
  }),
  matos: one(matosTable, {
    fields: [resaMatosTable.matosId],
    references: [matosTable.id],
  }),
}));