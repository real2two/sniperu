import type { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { createOption } from "../utils/createOption";

export type Option<T extends ApplicationCommandOptionType> = ReturnType<
	typeof createOption<T>
>;

export interface OptionBuilder {
	attachment: Option<ApplicationCommandOptionType.Attachment>;
	boolean: Option<ApplicationCommandOptionType.Boolean>;
	channel: Option<ApplicationCommandOptionType.Channel>;
	integer: Option<ApplicationCommandOptionType.Integer>;
	mentionable: Option<ApplicationCommandOptionType.Mentionable>;
	number: Option<ApplicationCommandOptionType.Number>;
	role: Option<ApplicationCommandOptionType.Role>;
	string: Option<ApplicationCommandOptionType.String>;
	user: Option<ApplicationCommandOptionType.User>;
}

export type BuildableOption = ReturnType<OptionBuilder[keyof OptionBuilder]>;
