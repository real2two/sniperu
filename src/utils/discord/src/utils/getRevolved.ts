/** biome-ignore-all lint/suspicious/noExplicitAny: allow any */

import type {
	APIAttachment,
	APIBaseInteraction,
	APIChannel,
	APIInteractionGuildMember,
	APIMessage,
	APIRole,
	APIUser,
	InteractionType,
} from "discord-api-types/v10";

export function getRevolved(
	interaction: APIBaseInteraction<InteractionType, any>,
) {
	const member = interaction.member as APIInteractionGuildMember;
	const user = member?.user || (interaction.user as APIUser);
	return {
		user: (id: string) =>
			user.id !== id
				? (interaction.data?.resolved?.users?.[id] as APIUser | undefined)
				: user,
		member: (id: string) =>
			user.id !== id
				? (interaction.data?.resolved?.members?.[id] as
						| APIInteractionGuildMember
						| undefined)
				: member,
		role: (id: string) =>
			interaction.data?.resolved?.roles?.[id] as APIRole | undefined,
		channel: (id: string) =>
			interaction.data?.resolved?.channels?.[id] as APIChannel | undefined,
		message: (id: string) =>
			interaction.data?.resolved?.messages?.[id] as APIMessage | undefined,
		attachment: (id: string) =>
			interaction.data?.resolved?.attachments?.[id] as
				| APIAttachment
				| undefined,
	};
}
