ALTER TABLE `likes` RENAME COLUMN `drawing_uri` TO `subject_uri`;
--> statement-breakpoint
DROP INDEX IF EXISTS `unique_like_did`;
--> statement-breakpoint
DROP INDEX IF EXISTS `unique_like_guest`;
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_like_did` ON `likes` (`subject_uri`,`liker_did`);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_like_guest` ON `likes` (`subject_uri`,`guest_token`);
