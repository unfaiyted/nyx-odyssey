import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const examples = pgTable('examples', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
