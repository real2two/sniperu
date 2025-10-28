import { client } from "../src/client";

try {
	const res = await client.registerCommands();
	const body = (await res.json()) as unknown[];
	console.info(body);

	if (!res.ok) throw new Error("Failed to create commands");

	console.info(
		`[CREATE COMMANDS] Successfully created ${body.length} commands!`,
	);

	process.exit();
} catch (err) {
	console.error(
		"[CREATE COMMANDS] Failed to create commands. Are you sure you have internet connection?",
	);
	throw err;
}
