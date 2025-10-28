/** biome-ignore-all lint/suspicious/noExplicitAny: allow any */

import type {
	APIApplicationCommandInteractionDataAttachmentOption,
	APIApplicationCommandInteractionDataBooleanOption,
	APIApplicationCommandInteractionDataChannelOption,
	APIApplicationCommandInteractionDataIntegerOption,
	APIApplicationCommandInteractionDataMentionableOption,
	APIApplicationCommandInteractionDataNumberOption,
	APIApplicationCommandInteractionDataRoleOption,
	APIApplicationCommandInteractionDataStringOption,
	APIApplicationCommandInteractionDataUserOption,
	APIApplicationCommandOption,
	APIApplicationCommandSubcommandGroupOption,
	APIApplicationCommandSubcommandOption,
	APIBaseInteraction,
	InteractionType,
} from "discord-api-types/v10";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export function digThroughSubcommandOptions(
	options:
		| APIApplicationCommandOption[]
		| APIApplicationCommandSubcommandOption[] = [],
) {
	const newOptions = options?.find((o) =>
		[
			ApplicationCommandOptionType.Subcommand,
			ApplicationCommandOptionType.SubcommandGroup,
		].includes(o?.type),
	) as
		| APIApplicationCommandSubcommandOption
		| APIApplicationCommandSubcommandGroupOption;
	if (newOptions) return digThroughSubcommandOptions(newOptions?.options);
	return options;
}

export function getOptions(
	interaction: APIBaseInteraction<InteractionType, any>,
) {
	return {
		values: (): string[] => interaction.data?.values ?? [],
		attachment: (name: string) =>
			(
				digThroughSubcommandOptions(interaction.data?.options).find(
					(o) =>
						o?.type === ApplicationCommandOptionType.Attachment &&
						o?.name === name,
				) as APIApplicationCommandInteractionDataAttachmentOption | undefined
			)?.value,
		boolean: (name: string) =>
			(
				digThroughSubcommandOptions(interaction.data?.options).find(
					(o) =>
						o?.type === ApplicationCommandOptionType.Boolean &&
						o?.name === name,
				) as APIApplicationCommandInteractionDataBooleanOption | undefined
			)?.value,
		channel: (name: string) =>
			(
				digThroughSubcommandOptions(interaction.data?.options).find(
					(o) =>
						o?.type === ApplicationCommandOptionType.Channel &&
						o?.name === name,
				) as APIApplicationCommandInteractionDataChannelOption | undefined
			)?.value,
		integer: (name: string) =>
			(
				digThroughSubcommandOptions(interaction.data?.options).find(
					(o) =>
						o?.type === ApplicationCommandOptionType.Integer &&
						o?.name === name,
				) as APIApplicationCommandInteractionDataIntegerOption | undefined
			)?.value as number,
		mentionable: (name: string) =>
			(
				digThroughSubcommandOptions(interaction.data?.options).find(
					(o) =>
						o?.type === ApplicationCommandOptionType.Mentionable &&
						o?.name === name,
				) as APIApplicationCommandInteractionDataMentionableOption | undefined
			)?.value,
		number: (name: string) =>
			(
				digThroughSubcommandOptions(interaction.data?.options).find(
					(o) =>
						o?.type === ApplicationCommandOptionType.Number && o?.name === name,
				) as APIApplicationCommandInteractionDataNumberOption | undefined
			)?.value as number,
		role: (name: string) =>
			(
				digThroughSubcommandOptions(interaction.data?.options).find(
					(o) =>
						o?.type === ApplicationCommandOptionType.Role && o?.name === name,
				) as APIApplicationCommandInteractionDataRoleOption | undefined
			)?.value,
		string: (name: string) =>
			(
				digThroughSubcommandOptions(interaction.data?.options).find(
					(o) =>
						o?.type === ApplicationCommandOptionType.String && o?.name === name,
				) as APIApplicationCommandInteractionDataStringOption | undefined
			)?.value,
		user: (name: string) =>
			(
				digThroughSubcommandOptions(interaction.data?.options).find(
					(o) =>
						o?.type === ApplicationCommandOptionType.User && o?.name === name,
				) as APIApplicationCommandInteractionDataUserOption | undefined
			)?.value,
	};
}
