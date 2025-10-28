import {
	ApplicationIntegrationType,
	InteractionContextType,
	MessageFlags,
} from "discord-api-types/v10";
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
	getCachedCourses,
	getCachedCurrentSemester,
	getCachedOpenSections,
	getNextSemester,
	getPreviousSemester,
	type Term,
} from "$utils/soc";

export class SnipeClassCommand extends Command {
	name = "snipe_class";
	override description = "Snipe a course.";
	override opts = (o: OptionBuilder) => ({
		semester: o
			.string("The semester you want to snipe courses.")
			.autocomplete()
			.required(),
		course: o
			.string("The course you are trying to snipe.")
			.autocomplete()
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
			case "course": {
				if (
					!availableSemesters
						.map((s) => `${s.term} ${s.year}`)
						.includes(semester)
				)
					return reply([]);

				const splitSemester = semester.split(" ") as [string, string];

				const year = Number.parseInt(splitSemester[1], 10);
				const term = splitSemester[0] as Term;
				const campus = Campus.NB;
				const courseId = opts.string("course") as string;

				const courses = getCachedCourses({ year, term, campus });
				if (!courses) return reply([]);

				const searchedCourses = courses
					.filter(({ id, title }) =>
						`[${id}] ${title}`.toUpperCase().includes(courseId.toUpperCase()),
					)
					.slice(0, 25);

				return reply(
					searchedCourses.map(({ id, title }) => ({
						name: `[${id}] ${title}`,
						value: id,
					})),
				);
			}
		}
	}

	async run({ guildId, user, member, opts, reply }: Interaction) {
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
		const courseId = opts.string("course") as string;

		const courses = getCachedCourses({ year, term, campus });
		if (!courses) return; // should never happen

		const course = courses.find(({ id }) => id === courseId);
		if (!course) {
			return reply({
				content:
					"❌ You need to enter a valid course to snipe. **Usage:** </snipe_class:1412475345386606738> <index>.",
				flags: MessageFlags.Ephemeral,
			});
		}

		if (!course.sections.length) {
			return reply({
				content: "❌ There are no sections for this course!",
				flags: MessageFlags.Ephemeral,
			});
		}

		const openSections = getCachedOpenSections({ year, term, campus });
		const addedSections = course.sections
			.map((s) => s.index)
			.filter((value) => !openSections?.includes(value));

		await db
			.insert(snipeRequests)
			.values(
				addedSections.map((i) => ({
					userId: user.id,
					year,
					term,
					campus,
					courseIndex: i,
				})),
			)
			.onConflictDoNothing();

		return reply({
			embeds: [
				{
					color: 0x57f287,
					author: {
						name: `Added snipe request${addedSections.length === 1 ? "" : "s"}!`,
						icon_url: getDiscordAvatar({ user, member, guildId }),
					},
					description: `Successfully added course${addedSections.length === 1 ? "" : "s"} ${addedSections.map((s) => `\`${s}\``).join(", ")} to your snipe requests.`,
					timestamp: new Date().toISOString(),
				},
			],
		});
	}
}
