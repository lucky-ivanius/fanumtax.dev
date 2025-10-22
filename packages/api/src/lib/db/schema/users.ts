import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";

import { timestamps } from "../timestamps";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v7()),

  address: text("address").unique().notNull(),
  formattedAddress: text("formatted_address").unique().notNull(),

  ...timestamps,
});
