CREATE TABLE `connections` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`external_user_id` text NOT NULL,
	`external_username` text NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `connections_index_user_id_type` ON `connections` (`user_id`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `connections_unique_user_id_type_external_user_id` ON `connections` (`user_id`,`type`,`external_user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`address` text NOT NULL,
	`formatted_address` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_address_unique` ON `users` (`address`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_formatted_address_unique` ON `users` (`formatted_address`);