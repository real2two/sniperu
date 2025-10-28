import {
	ApplicationIntegrationType,
	InteractionContextType,
	MessageFlags,
} from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import { snipeRequests } from "$schema/snipeRequests";
import { db } from "$utils/connectors/psql";
import {
	type AutocompleteInteraction,
	Command,
	getDiscordAvatar,
	type Interaction,
	type OptionBuilder,
} from "$utils/discord";
import {
	Campus,
	getCachedCurrentSemester,
	getNextSemester,
	getPreviousSemester,
	type Term,
} from "$utils/soc";

export class StopCommand extends Command {
	name = "stop";
	override description = "Stop sniping a course.";
	override opts = (o: OptionBuilder) => ({
		semester: o
			.string("The semester you want to snipe courses.")
			.autocomplete()
			.required(),
		index: o
			.string(
				"The index of the course you are trying to remove the snipe request for.",
			)
			.required(),
	});

	override integration_types = [ApplicationIntegrationType.UserInstall];
	override contexts = [InteractionContextType.BotDM];

	override async autocomplete({
		interaction,
		opts,
		reply,
	}: AutocompleteInteraction) {
		const focused: string = interaction.data?.options?.find(
			(o: { name: string; focused: boolean }) => o.focused,
		)?.name;

		const semester = opts.string("semester")?.trim() || "";

		const currentSemester = getCachedCurrentSemester();
		const previousSemester = getPreviousSemester(currentSemester);
		const nextSemester = getNextSemester(currentSemester);

		const availableSemesters = [
			previousSemester,
			currentSemester,
			nextSemester,
		];

		switch (focused) {
			case "semester": {
				return reply(
					availableSemesters
						.map((s) => ({
							name: `${s.term} ${s.year}`,
							value: `${s.term} ${s.year}`,
						}))
						.filter((s) => s.value.startsWith(semester)),
				);
			}
		}
	}

	async run({ user, member, guildId, opts, reply }: Interaction) {
		const currentSemester = getCachedCurrentSemester();
		const previousSemester = getPreviousSemester(currentSemester);
		const nextSemester = getNextSemester(currentSemester);

		const availableSemesters = [
			previousSemester,
			currentSemester,
			nextSemester,
		];

		const semester = opts.string("semester")?.trim() || "";
		if (
			!availableSemesters.map((s) => `${s.term} ${s.year}`).includes(semester)
		) {
			return reply({
				content: "❌ You have provided an invalid semester.",
				flags: MessageFlags.Ephemeral,
			});
		}

		const splitSemester = semester.split(" ") as [string, string];

		const year = Number.parseInt(splitSemester[1], 10);
		const term = splitSemester[0] as Term;
		const campus = Campus.NB;
		const courseIndex = opts.string("index") as string;

		const removed = await db
			.delete(snipeRequests)
			.where(
				and(
					eq(snipeRequests.userId, user.id),
					eq(snipeRequests.year, year),
					eq(snipeRequests.term, term),
					eq(snipeRequests.campus, campus),
					eq(snipeRequests.courseIndex, courseIndex),
				),
			)
			.returning();

		if (!removed.length) {
			return reply({
				content: "❌ You were not sniping this course.",
				flags: MessageFlags.Ephemeral,
			});
		}

		return reply({
			embeds: [
				{
					color: 0xfee75c,
					author: {
						name: "Removed snipe request.",
						icon_url: getDiscordAvatar({ user, member, guildId }),
					},
					description: `Successfully removed course \`${courseIndex}\` from your snipe requests.`,
					timestamp: new Date().toISOString(),
				},
			],
		});
	}
}
