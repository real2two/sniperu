import { getCourses, getCurrentSemester, getOpenSections } from "./api";
import { type CachedCourse, type Campus, Term } from "./types";

// Current semester
let currentSemester: { year: number; term: Term } = {
	year: 0,
	term: Term.Winter,
};

// Cache full courses
const cachedCourses = new Map<string, CachedCourse[]>();

// Open sections
const openSections = new Map<string, string[]>();

// All sections
const allSections = new Map<string, string[]>();

// Fast section lookup
const sectionLookups = new Map<
	string,
	Map<string, { id: string; title: string; number: string }>
>();

export async function cacheCurrentSemester() {
	currentSemester = await getCurrentSemester();
	return currentSemester;
}

export async function cacheCourses({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	const key = `${year}:${term}:${campus}`;
	const courses = await getCourses({ year, term, campus });

	const parsedCourses = courses.map((c) => ({
		id: c.courseString,
		title: c.title,
		sections: c.sections.map((s) => ({
			number: s.number,
			index: s.index,
			raw: s.meetingTimes,
			meetingTimes: s.meetingTimes.map((m) => ({
				campus: m.campusName,
				room: `${m.buildingCode}-${m.roomNumber}`,
				// dayOfWeek: m,
				start: `${m.startTime.slice(0, 2)}:${m.startTime.slice(-2)}${m.pmCode === "A" ? "AM" : "PM"}`,
				end: `${m.endTime.slice(0, 2)}:${m.endTime.slice(-2)}${m.pmCode === "A" ? "AM" : "PM"}`,
			})),
			specialNotes: s.sectionNotes, // ???
		})),
	}));

	cachedCourses.set(key, parsedCourses);

	// All sections
	allSections.set(
		key,
		courses.flatMap((course) => course.sections.map((s) => s.index)),
	);

	// Build fast section -> course lookup
	const sectionLookup = new Map<
		string,
		{ id: string; title: string; number: string }
	>();
	parsedCourses.forEach((c) => {
		c.sections.forEach((s) => {
			sectionLookup.set(s.index, {
				id: c.id,
				title: c.title,
				number: s.number,
			});
		});
	});
	sectionLookups.set(key, sectionLookup);

	return parsedCourses;
}

export async function cacheOpenSections({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	const key = `${year}:${term}:${campus}`;
	const sections = await getOpenSections({ year, term, campus });

	openSections.set(key, sections);
	return sections;
}

export async function uncacheCourses({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	const key = `${year}:${term}:${campus}`;

	cachedCourses.delete(key);
	allSections.delete(key);
	sectionLookups.delete(key);
	openSections.delete(key);
}

export function getCachedCurrentSemester() {
	return currentSemester;
}

export function getCachedCourses({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	const key = `${year}:${term}:${campus}`;
	return cachedCourses.get(key);
}

export function getCachedSections({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	return allSections.get(`${year}:${term}:${campus}`);
}

export function getAllSectionInfo({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	const key = `${year}:${term}:${campus}`;
	return sectionLookups.get(key);
}

export function getSectionInfo({
	year,
	term,
	campus,
	courseIndex,
}: {
	year: number;
	term: Term;
	campus: Campus;
	courseIndex: string;
}) {
	const key = `${year}:${term}:${campus}`;
	return sectionLookups.get(key)?.get(courseIndex);
}

export function getCachedOpenSections({
	year,
	term,
	campus,
}: {
	year: number;
	term: Term;
	campus: Campus;
}) {
	const key = `${year}:${term}:${campus}`;
	return openSections.get(key);
}
