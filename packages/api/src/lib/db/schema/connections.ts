import { index, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";

import { timestamps } from "../timestamps";
import { users } from "./users";

export const connectionTypes = ["github"] as const;

export const connections = sqliteTable(
  "connections",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => v7()),

    type: text("type", { enum: connectionTypes }).notNull(),
    externalUserId: text("external_user_id").notNull(),
    externalUsername: text("external_username").notNull(),

    token: text("token").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => users.id),

    ...timestamps,
  },
  (t) => [
    index("connections_index_user_id_type").on(t.userId, t.type),
    unique("connections_unique_user_id_type_external_user_id").on(t.userId, t.type, t.externalUserId),
  ]
);
