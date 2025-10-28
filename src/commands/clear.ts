import {
	ApplicationIntegrationType,
	InteractionContextType,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { snipeRequests } from "$schema/snipeRequests";
import { db } from "$utils/connectors/psql";
import { Command, getDiscordAvatar, type Interaction } from "$utils/discord";

export class ClearCommand extends Command {
	name = "clear";
	override description = "Stop sniping all courses.";

	override integration_types = [ApplicationIntegrationType.UserInstall];
	override contexts = [InteractionContextType.BotDM];

	async run({ user, member, guildId, reply }: Interaction) {
		await db.delete(snipeRequests).where(eq(snipeRequests.userId, user.id));

		return reply({
			embeds: [
				{
					color: 0xfee75c,
					author: {
						name: "Removed all snipe requests!",
						icon_url: getDiscordAvatar({ user, member, guildId }),
					},
					description: "You have removed all your snipe requests.",
					timestamp: new Date().toISOString(),
				},
			],
		});
	}
}
