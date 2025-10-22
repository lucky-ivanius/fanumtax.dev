PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`external_user_id` text NOT NULL,
	`external_username` text NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_connections`("id", "provider", "external_user_id", "external_username", "token", "user_id", "created_at", "updated_at") SELECT "id", "provider", "external_user_id", "external_username", "token", "user_id", "created_at", "updated_at" FROM `connections`;--> statement-breakpoint
DROP TABLE `connections`;--> statement-breakpoint
ALTER TABLE `__new_connections` RENAME TO `connections`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `connections_unique_index_user_id_provider` ON `connections` (`user_id`,`provider`);--> statement-breakpoint
CREATE UNIQUE INDEX `connections_unique_provider_external_user_id` ON `connections` (`provider`,`external_user_id`);