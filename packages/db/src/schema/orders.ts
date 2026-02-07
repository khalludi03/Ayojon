import { pgTable, text, timestamp, numeric, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").default("pending").notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
  ]
);
