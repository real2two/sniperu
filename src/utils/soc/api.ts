import { load } from "cheerio";
import { type Campus, type Course, Term } from "./types";

const termCodeMap = {
	[Term.Fall]: "9",
	[Term.Summer]: "7",
	[Term.Spring]: "1",
	[Term.Winter]: "0",
} as const;

const reverseTermCodeMap = {
	"9": Term.Fall,
	"7": Term.Summer,
	"1": Term.Spring,
	"0": Term.Winter,
} as const;

export function getSemesterId({ year, term }: { year: number; term: Term }) {
	return `${termCodeMap[term]}${year}`;
}

export async function getCurrentSemester() {
	const socHome = await fetch("https://classes.rutgers.edu/soc");
	const $ = load(await socHome.text());

	const jsonText = $("#initJsonData").text();
	const jsonData = JSON.parse(jsonText);

	const { year, term } = jsonData.currentTermDate as {
		year: number;
		term: number;
	};

	return {
		year,
		term: reverseTermCodeMap[term.toString() as "9" | "7" | "1" | "0"],
	};
}

export function getPreviousSemester({
	year,
	term,
}: {
	year: number;
	term: Term;
}) {
	const data = { year, term };
	switch (term) {
		case Term.Spring:
			data.term = Term.Winter;
			break;
		case Term.Summer:
			data.term = Term.Spring;
			break;
		case Term.Fall:
			data.term = Term.Summer;
			break;
		case Term.Winter:
			data.term = Term.Fall;
			data.year--;
			break;
	}
	return data;
}

export function getNextSemester({ year, term }: { year: number; term: Term }) {
	const data = { year, term };
	switch (term) {
		case Term.Spring:
			data.term = Term.Summer;
			break;
		case Term.Summer:
			data.term = Term.Fall;
			break;
		case Term.Fall:
			data.term = Term.Winter;
			data.year++;
			break;
		case Term.Winter:
			data.term = Term.Spring;
			break;
	}
	return data;
}

export function getCourseRegisterLink({
	year,
	term,
	courseIndex,
}: {
	year: number;
	term: Term;
	courseIndex: string;
}) {
	return `https://sims.rutgers.edu/webreg/editSchedule.htm?login=cas&semesterSelection=${getSemesterId({ year, term })}&indexList=${courseIndex}`;
}

export async function getCourses({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	const params = new URLSearchParams({
		year: year.toString(),
		term: termCodeMap[term],
		campus,
	});

	const res = await fetch(
		`https://classes.rutgers.edu/soc/api/courses.json?${params}`,
	);
	if (!res.ok) throw new Error("Failed to get courses from SoC");

	return (await res.json()) as Course[];
}

export async function getOpenSections({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	const params = new URLSearchParams({
		year: year.toString(),
		term: termCodeMap[term],
		campus,
	});

	const res = await fetch(
		`https://classes.rutgers.edu/soc/api/openSections.json?${params}`,
	);
	if (!res.ok) throw new Error("Failed to get open sections from SoC");

	return (await res.json()) as string[];
}
