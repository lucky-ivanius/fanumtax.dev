import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";

import { timestamps } from "../timestamps";

export const platforms = ["github"] as const;

export const repositories = sqliteTable(
  "repositories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => v7()),

    platform: text("platform", { enum: platforms }).notNull(),

    owner: text("owner").notNull(),
    name: text("name").notNull(),

    description: text("description").notNull().default(""),

    url: text("url").notNull(),

    stars: integer("stars").notNull().default(0),
    forks: integer("forks").notNull().default(0),

    license: text("license"),
    language: text("language"),

    totalBountyUsd: integer("total_bounty_usd").notNull().default(0),

    ...timestamps,
  },
  (t) => [
    uniqueIndex("repositories_unique_platform_owner_name").on(t.platform, t.owner, t.name),
    index("repositories_index_license").on(t.license),
    index("repositories_index_language").on(t.language),
  ]
);
