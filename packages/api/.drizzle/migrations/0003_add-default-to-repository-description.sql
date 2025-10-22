PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_repositories` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`url` text NOT NULL,
	`stars` integer DEFAULT 0 NOT NULL,
	`forks` integer DEFAULT 0 NOT NULL,
	`license` text,
	`language` text,
	`total_bounty_usd` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_repositories`("id", "platform", "owner", "name", "description", "url", "stars", "forks", "license", "language", "total_bounty_usd", "created_at", "updated_at") SELECT "id", "platform", "owner", "name", "description", "url", "stars", "forks", "license", "language", "total_bounty_usd", "created_at", "updated_at" FROM `repositories`;--> statement-breakpoint
DROP TABLE `repositories`;--> statement-breakpoint
ALTER TABLE `__new_repositories` RENAME TO `repositories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `repositories_unique_platform_owner_name` ON `repositories` (`platform`,`owner`,`name`);--> statement-breakpoint
CREATE INDEX `repositories_index_license` ON `repositories` (`license`);--> statement-breakpoint
CREATE INDEX `repositories_index_language` ON `repositories` (`language`);