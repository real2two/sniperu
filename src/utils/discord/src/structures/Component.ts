import type { Interaction } from "../types/interaction";

export abstract class Component {
	abstract customId: string;
	abstract run(interaction: Interaction): unknown | Promise<unknown>;
}
