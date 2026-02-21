import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

import { usertable } from "./user.model.js";

export const urlsTable = pgTable("urls", {
  id: uuid().primaryKey().defaultRandom(),
  shortcode: varchar("code", { length: 155 }).notNull().unique(),
  targetURL: text("target_url").notNull(),

  userId: uuid()
    .references(() => usertable.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
