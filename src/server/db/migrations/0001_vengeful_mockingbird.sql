CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`isbn` text,
	`published_year` integer,
	`genre` text,
	`description` text,
	`page_count` integer,
	`language` text DEFAULT 'English',
	`publisher` text,
	`cover_image_url` text,
	`price` integer,
	`stock` integer DEFAULT 0,
	`is_available` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_isbn_unique` ON `books` (`isbn`);