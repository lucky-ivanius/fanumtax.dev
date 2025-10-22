import { sqliteTable, text, unique, uniqueIndex } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";

import { timestamps } from "../timestamps";
import { users } from "./users";

export const connectionProviders = ["github"] as const;

export const connections = sqliteTable(
  "connections",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => v7()),

    provider: text("provider", { enum: connectionProviders }).notNull(),
    externalUserId: text("external_user_id").notNull(),
    externalUsername: text("external_username").notNull(),

    token: text("token").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    ...timestamps,
  },
  (t) => [
    uniqueIndex("connections_unique_index_user_id_provider").on(t.userId, t.provider),
    unique("connections_unique_provider_external_user_id").on(t.provider, t.externalUserId),
  ]
);
