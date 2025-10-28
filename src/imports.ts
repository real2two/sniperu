/** biome-ignore-all lint/suspicious/noExplicitAny: allow any */

import { join } from "node:path";
import { Glob } from "bun";
import { Command, CommandWithSubcommands, Component } from "$utils/discord";

const glob = new Glob("**/*.{ts,tsx}");

await scanAndImport("hooks"); // preload hooks

export const commands: (Command | CommandWithSubcommands)[] = (
	await scanAndImport("commands")
)
	.filter(
		(c) => isSubclassOf(c, Command) || isSubclassOf(c, CommandWithSubcommands),
	)
	// @ts-expect-error It works
	.map((c) => new c());

export const components: Component[] = (await scanAndImport("components"))
	.filter((c) => isSubclassOf(c, Component))
	// @ts-expect-error It works
	.map((c) => new c());

async function scanAndImport(dir: string) {
	const path = join(`${import.meta.dir}/${dir}`);
	return (
		await Promise.all(
			[...glob.scanSync(path)].map((f) => import(`${path}/${f}`)),
		)
	).flatMap((e) => Object.values(e));
}

function isSubclassOf(subclass: any, superclass: any): boolean {
	let proto = subclass;
	while (proto) {
		if (proto === superclass) return true;
		proto = Object.getPrototypeOf(proto);
	}
	return false;
}
