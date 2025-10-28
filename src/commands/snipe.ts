import {
	ApplicationIntegrationType,
	InteractionContextType,
	MessageFlags,
} from "discord-api-types/v10";
import { snipeHandler } from "$handlers";
import {
	type AutocompleteInteraction,
	Command,
	type Interaction,
	type OptionBuilder,
} from "$utils/discord";
import {
	Campus,
	getAllSectionInfo,
	getCachedCurrentSemester,
	getNextSemester,
	getPreviousSemester,
	type Term,
} from "$utils/soc";

export class SnipeCommand extends Command {
	name = "snipe";
	override description = "Snipe a course's section.";
	override opts = (o: OptionBuilder) => ({
		semester: o
			.string("The semester you want to snipe courses.")
			.autocomplete()
			.required(),
		index: o
			.string("The index of the course you are trying to snipe.")
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
			case "index": {
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
				const courseIndex = opts.string("index") as string;

				const sections = getAllSectionInfo({ year, term, campus });
				if (!sections) return reply([]);

				const searchedSections = [...sections.entries()]
					.filter(([index, { title, number }]) =>
						`[${index}] ${title} - Section ${number}`
							.toUpperCase()
							.includes(courseIndex.toUpperCase()),
					)
					.slice(0, 25);

				return reply(
					searchedSections.map(([index, { title, number }]) => ({
						name: `[${index}] ${title} - Section ${number}`,
						value: index,
					})),
				);
			}
		}
	}

	async run(interaction: Interaction) {
		const { opts, reply } = interaction;

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

		snipeHandler.run(interaction, { year, term, campus, courseIndex });
	}
}
