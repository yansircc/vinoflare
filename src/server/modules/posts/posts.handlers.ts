import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import type { BaseContext } from "@/server/core/worker-types";
import type { InsertPost, postId } from "./posts.schema";
import { posts } from "./posts.table";

export const getLatestPostHandler = async (c: Context<BaseContext>) => {
	const db = c.get("db");
	const post = await db.query.posts.findFirst({
		orderBy: (posts, { desc }) => [desc(posts.id)],
	});

	if (!post) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "Post not found",
		});
	}

	return c.json({ post }, StatusCodes.OK);
};

export const createPostHandler = async (
	c: Context<BaseContext>,
	input: { body?: InsertPost },
) => {
	if (!input.body) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Request body is required",
			cause: { code: "INVALID_REQUEST_BODY" },
		});
	}

	if (!input.body.title) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "Title is required",
		});
	}

	const db = c.get("db");

	// Check for duplicate title
	const existing = await db.query.posts.findFirst({
		where: (posts, { eq }) => eq(posts.title, input.body!.title),
	});

	if (existing) {
		throw new HTTPException(StatusCodes.CONFLICT, {
			message: `Post with title "${input.body.title}" already exists`,
			cause: { code: "DUPLICATE_TITLE" },
		});
	}

	// Create the post
	const [newPost] = await db
		.insert(posts)
		.values({
			title: input.body.title,
		})
		.returning();

	return c.json({ post: newPost }, StatusCodes.CREATED);
};

export const getPostByIdHandler = async (
	c: Context<BaseContext>,
	input: { params?: { id: postId } },
) => {
	// ID validation is now handled automatically by the APIBuilder
	const id = input.params?.id;
	if (!id) {
		throw new HTTPException(StatusCodes.BAD_REQUEST, {
			message: "ID parameter is required",
		});
	}

	const db = c.get("db");
	const post = await db.query.posts.findFirst({
		where: (posts, { eq }) => eq(posts.id, id),
	});

	if (!post) {
		throw new HTTPException(StatusCodes.NOT_FOUND, {
			message: "Post not found",
		});
	}

	return c.json({ post }, StatusCodes.OK);
};
