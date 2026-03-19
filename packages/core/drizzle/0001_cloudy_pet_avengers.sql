CREATE TABLE `corpses` (
	`id` text PRIMARY KEY NOT NULL,
	`record_uri` text NOT NULL,
	`top_uri` text NOT NULL,
	`mid_uri` text NOT NULL,
	`bot_uri` text NOT NULL,
	`title` text NOT NULL,
	`moderation_status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_guest_drawings` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_token` text,
	`did` text,
	`record_uri` text NOT NULL,
	`section` text NOT NULL,
	`corpse_id` text,
	`moderation_status` text DEFAULT 'pending' NOT NULL,
	`reserved_until` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_guest_drawings`("id", "guest_token", "did", "record_uri", "section", "corpse_id", "moderation_status", "reserved_until", "created_at") SELECT "id", "guest_token", NULL, "record_uri", "section", NULL, 'pending', NULL, "created_at" FROM `guest_drawings`;--> statement-breakpoint
DROP TABLE `guest_drawings`;--> statement-breakpoint
ALTER TABLE `__new_guest_drawings` RENAME TO `guest_drawings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;