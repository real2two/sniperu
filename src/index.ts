import { Hono } from "hono";
import { client } from "./client";
import { PORT } from "./env";

import "./cron";

const app = new Hono();

app.post("/interactions", (c) => client.handleInteractions(c.req.raw));

Bun.serve({
	port: PORT,
	fetch: app.fetch,
});

console.info(`Bot started at http://localhost:${PORT}`);
