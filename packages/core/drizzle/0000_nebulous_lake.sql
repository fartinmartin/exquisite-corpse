CREATE TABLE `guest_drawings` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_token` text NOT NULL,
	`record_uri` text NOT NULL,
	`section` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`drawing_uri` text NOT NULL,
	`liker_did` text,
	`guest_token` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_like_did` ON `likes` (`drawing_uri`,`liker_did`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_like_guest` ON `likes` (`drawing_uri`,`guest_token`);--> statement-breakpoint
CREATE TABLE `oauth_sessions` (
	`key` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_states` (
	`key` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`did` text PRIMARY KEY NOT NULL,
	`handle` text NOT NULL,
	`display_name` text,
	`avatar_cid` text,
	`indexed_at` text DEFAULT (datetime('now')) NOT NULL
);
