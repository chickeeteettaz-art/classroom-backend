import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'demo_users' table
export const demoUsers = pgTable('demo_users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types for type-safe queries
export type DemoUser = typeof demoUsers.$inferSelect;
export type NewDemoUser = typeof demoUsers.$inferInsert;

export * from './app.js';
export * from './auth.js';
