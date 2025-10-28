/** biome-ignore-all lint/complexity/noBannedTypes: allow object */

import type { Interaction } from "../types/interaction";

export abstract class Handler<Args extends object = {}> {
	abstract run(
		interaction: Interaction,
		args: Args,
	): unknown | Promise<unknown>;
}
