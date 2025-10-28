import {
	ApplicationIntegrationType,
	InteractionContextType,
} from "discord-api-types/v10";
import { eq, sql } from "drizzle-orm";
import { snipeRequests } from "$schema/snipeRequests";
import { db } from "$utils/connectors/psql";
import {
	Command,
	getDiscordAvatar,
	type Interaction,
	type OptionBuilder,
} from "$utils/discord";
import { getSectionInfo } from "$utils/soc";

export class listCommand extends Command {
	name = "list";
	override description = "List all of the courses you are sniping.";
	override opts = (o: OptionBuilder) => ({
		page: o.integer("The page of the courses you are sniping.").min(1),
	});

	override integration_types = [ApplicationIntegrationType.UserInstall];
	override contexts = [InteractionContextType.BotDM];

	async run({ user, member, guildId, opts, reply }: Interaction) {
		let page = opts.integer("page") || 0;
		if (page < 1) page = 1;

		const courseCount =
			((
				await db
					.select({
						count: sql`count(*)`,
					})
					.from(snipeRequests)
					.where(eq(snipeRequests.userId, user.id))
			)[0]?.count as number) || 0;
		const lastPage = Math.ceil(courseCount / 15);

		const courses = await db
			.select({
				year: snipeRequests.year,
				term: snipeRequests.term,
				campus: snipeRequests.campus,
				courseIndex: snipeRequests.courseIndex,
				totalUsers: sql<number>`count(distinct ${snipeRequests.userId})`.as(
					"totalUsers",
				),
			})
			.from(snipeRequests)
			.where(eq(snipeRequests.userId, user.id))
			.groupBy(
				snipeRequests.year,
				snipeRequests.term,
				snipeRequests.campus,
				snipeRequests.courseIndex,
			)
			.offset((page - 1) * 15)
			.limit(15);

		return reply({
			embeds: [
				{
					color: 0x5865f2,
					author: {
						name: `${member?.nick || user.global_name || user.username}'s snipe requests`,
						icon_url: getDiscordAvatar({ user, member, guildId }),
					},
					description: !courses.length
						? page === 1
							? "You are not sniping any courses currently."
							: "There are no courses on this page."
						: courses
								.map((c) => {
									const section = getSectionInfo(c);
									return `- 👀 ${c.totalUsers} \`[${c.courseIndex}]\` **${section?.title}** - Section ${section?.number} (${c.term} ${c.year})`;
								})
								.join("\n"),
					footer: {
						text: `Page ${page} of ${lastPage} (${courseCount} total)`,
					},
					timestamp: new Date().toISOString(),
				},
			],
		});
	}
}
