CREATE TABLE `alert_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_id` text NOT NULL,
	`trade_id` text NOT NULL,
	`sent_at` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `alert_subscriptions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`trade_id`) REFERENCES `trades`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_deliveries_uniq` ON `alert_deliveries` (`subscription_id`,`trade_id`);--> statement-breakpoint
CREATE TABLE `alert_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`filter_value` text,
	`channel` text DEFAULT 'email' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_subscriptions_uniq` ON `alert_subscriptions` (`user_id`,`type`,`filter_value`);--> statement-breakpoint
CREATE TABLE `ingestion_state` (
	`source` text PRIMARY KEY NOT NULL,
	`last_run_at` integer,
	`last_hash` text,
	`last_seen_date` text
);
--> statement-breakpoint
CREATE TABLE `politicians` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`chamber` text NOT NULL,
	`state` text NOT NULL,
	`party` text NOT NULL,
	`district` text,
	`image_url` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` text PRIMARY KEY NOT NULL,
	`politician_id` text NOT NULL,
	`ticker` text NOT NULL,
	`asset_name` text NOT NULL,
	`asset_type` text NOT NULL,
	`transaction_type` text NOT NULL,
	`transaction_date` text NOT NULL,
	`disclosure_date` text NOT NULL,
	`amount_range_low` integer NOT NULL,
	`amount_range_high` integer NOT NULL,
	`chamber` text NOT NULL,
	`filing_url` text,
	`raw_json` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`politician_id`) REFERENCES `politicians`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);