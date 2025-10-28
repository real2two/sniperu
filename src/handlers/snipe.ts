import { MessageFlags } from "discord-api-types/v10";
import { snipeRequests } from "$schema/snipeRequests";
import { db } from "$utils/connectors/psql";
import { getDiscordAvatar, Handler, type Interaction } from "$utils/discord";
import { type Campus, getCachedSections, type Term } from "$utils/soc";

export class SnipeHandler extends Handler {
	async run(
		{ guildId, user, member, reply }: Interaction,
		{
			year,
			term,
			campus,
			courseIndex,
		}: { year: number; term: Term; campus: Campus; courseIndex: string },
	) {
		// Find all sections
		const sections = getCachedSections({ year, term, campus });

		// Error if the sections isn't cached
		if (!sections) {
			return reply({
				content: `🛑 You cannot snipe courses for \`${term} ${year}\`.`,
				flags: MessageFlags.Ephemeral,
			});
		}

		// Check if course index is valid
		if (!sections.includes(courseIndex)) {
			return reply({
				content:
					"❌ You need to enter a valid course index to snipe. **Usage:** </snipe:1409656693540782206> <index>.",
				flags: MessageFlags.Ephemeral,
			});
		}

		// Add snipe request to database
		await db
			.insert(snipeRequests)
			.values({ userId: user.id, year, term, campus, courseIndex })
			.onConflictDoNothing();

		// Respond with success message
		return reply({
			embeds: [
				{
					color: 0x57f287,
					author: {
						name: "Added snipe request!",
						icon_url: getDiscordAvatar({ user, member, guildId }),
					},
					description: `Successfully added course \`${courseIndex}\` to your snipe requests.`,
					timestamp: new Date().toISOString(),
				},
			],
		});
	}
}
