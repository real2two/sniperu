import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { and, eq, inArray } from "drizzle-orm";
import { DISCORD_BOT_TOKEN } from "$env";
import { snipeRequests } from "$schema/snipeRequests";
import { db } from "$utils/connectors/psql";
import { createParam, sendDm } from "$utils/discord";
import {
	Campus,
	cacheCourses,
	cacheCurrentSemester,
	cacheOpenSections,
	getCourseRegisterLink,
	getNextSemester,
	getPreviousSemester,
	getSectionInfo,
	type Term,
	uncacheCourses,
} from "$utils/soc";

await checkAllCourses();
checkOpenSections();

async function checkAllCourses() {
	// Get current semester
	const currentSemester = await cacheCurrentSemester();
	const previousSemester = getPreviousSemester(currentSemester);
	const nextSemester = getNextSemester(currentSemester);

	const availableSemesters = [previousSemester, currentSemester, nextSemester];

	// Cache relevant semesters
	for (const { year, term } of availableSemesters) {
		await cacheCourses({ year, term, campus: Campus.NB });
	}

	// Uncache the previous PREVIOUS semester
	const previousPreviousSemester = getPreviousSemester(previousSemester);
	uncacheCourses({
		year: previousPreviousSemester.year,
		term: previousPreviousSemester.term,
		campus: Campus.NB,
	});

	// Delete all snipe requests from the previous PREVIOUS semester
	await db
		.delete(snipeRequests)
		.where(
			and(
				eq(snipeRequests.year, previousPreviousSemester.year),
				eq(snipeRequests.term, previousPreviousSemester.term),
			),
		);

	// Recache 1 day later
	setTimeout(() => checkAllCourses(), 8.64e7);
}

async function checkOpenSections() {
	const terms = await db
		.selectDistinct({
			year: snipeRequests.year,
			term: snipeRequests.term,
			campus: snipeRequests.campus,
		})
		.from(snipeRequests);

	for (const { year, term, campus } of terms) {
		await checkOpenSectionsPerSemester({ year, term, campus });
	}

	setTimeout(() => checkOpenSections(), 1000);
}

async function checkOpenSectionsPerSemester({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	const openSections = await cacheOpenSections({ year, term, campus });
	const termSnipeRequests = await db
		.delete(snipeRequests)
		.where(
			and(
				eq(snipeRequests.year, year),
				eq(snipeRequests.term, term),
				eq(snipeRequests.campus, campus),
				inArray(snipeRequests.courseIndex, openSections),
			),
		)
		.returning({
			userId: snipeRequests.userId,
			courseIndex: snipeRequests.courseIndex,
		});

	for (const { userId, courseIndex } of termSnipeRequests) {
		if (!openSections.includes(courseIndex)) continue;

		try {
			const section = getSectionInfo({ year, term, campus, courseIndex });
			await sendDm(
				userId,
				{
					content: `> <@${userId}> **Section opened!**`,
					embeds: [
						{
							color: 0x5865f2,
							title: `${section?.title} (Section ${section?.number}) has opened!`,
							thumbnail: {
								url: "https://media.discordapp.net/attachments/1412287322522914936/1412287461002055751/target.png",
							},
							fields: [
								{
									name: "Course name",
									value: `\`${section?.title}\``,
									inline: true,
								},
								{
									name: "Index",
									value: `\`${courseIndex}\``,
									inline: true,
								},
								{
									name: "Section",
									value: `\`${section?.number}\``,
									inline: true,
								},
							],
							timestamp: new Date().toISOString(),
						},
					],
					components: [
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.Button,
									style: ButtonStyle.Link,
									label: "Register",
									url: getCourseRegisterLink({ year, term, courseIndex }),
								},
								{
									type: ComponentType.Button,
									style: ButtonStyle.Primary,
									custom_id: createParam("snipe", {
										year,
										term,
										campus,
										courseIndex,
									}),
									label: "Resnipe course",
								},
							],
						},
					],
				},
				DISCORD_BOT_TOKEN,
			);
		} catch (_) {
			console.error("Failed to DM user", userId, courseIndex);
		}
	}
}
