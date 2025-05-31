CREATE INDEX `todos_completed_idx` ON `todos` (`completed`);--> statement-breakpoint
CREATE INDEX `todos_priority_idx` ON `todos` (`priority`);--> statement-breakpoint
CREATE INDEX `todos_created_at_idx` ON `todos` (`created_at`);--> statement-breakpoint
CREATE INDEX `todos_completed_priority_idx` ON `todos` (`completed`,`priority`);