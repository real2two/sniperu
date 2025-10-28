export enum Campus {
	/** New Brunswick */
	NB = "NB",
	/** Newark */
	NK = "NK",
	/** Camden */
	CM = "CM",
	/** New Brunswick - Online and Remote Instruction Courses */
	ONLINE_NB = "ONLINE_NB",
	/** Newark - Online and Remote Instruction Courses */
	ONLINE_NK = "ONLINE_NK",
	/** Camden - Online and Remote Instruction Courses */
	ONLINE_CM = "ONLINE_CM",
	/** Burlington County Community College - Mt Laurel */
	B = "B",
	/** Camden County College - Blackwood Campus */
	CC = "CC",
	/** County College of Morris */
	H = "H",
	/** Cumberland County College */
	CU = "CU",
	/** Denville - RU-Morris */
	MC = "MC",
	/** Freehold WMHEC - RU-BCC */
	WM = "WM",
	/** Lincroft - RU-BCC */
	L = "L",
	/** Mays Landing - RU-ACCC */
	AC = "AC",
	/** McGuire-Dix-Lakehurst RU-JBMDL */
	J = "J",
	/** Mercer County Community College */
	D = "D",
	/** North Branch - RU-RVCC */
	RV = "RV",
}

export enum Term {
	Fall = "Fall",
	Summer = "Summer",
	Spring = "Spring",
	Winter = "Winter",
}

export interface Course {
	campusLocations: {
		code: string;
		description: string;
	}[];
	subject: string;
	openSections: number;
	synopsisUrl: string;
	title: string;
	preReqNotes: string;
	courseString: string;
	school: {
		code: string;
		description: string;
	};
	credits: number | null;
	subjectDescription: string;
	coreCodes: {
		id: string;
		year: string;
		term: string;
		description: string;
		course: string;
		subject: string;
		offeringUnitCode: string;
		offeringUnitCampus: string;
		code: string;
		unit: string;
		supplement: string;
		effective: string;
		coreCodeReferenceId: string;
		coreCode: string;
		coreCodeDescription: string;
		lastUpdated: number;
	}[];
	expandedTitle: string;
	courseFeeDescr: string;
	mainCampus: string;
	subjectNotes: string;
	courseNumber: string;
	creditsObject: {
		code: string;
		description: string;
	};
	level: string;
	campusCode: string;
	subjectGroupNotes: string;
	offeringUnitCode: string;
	offeringUnitTitle: string | null;
	courseDescription: string;
	sections: {
		sectionEligibility: string;
		sessionDatePrintIndicator: string;
		examCode: string;
		specialPermissionAddCode: string | null;
		crossListedSections: {
			courseNumber: string;
			supplementCode: string;
			sectionNumber: string;
			offeringUnitCampus: string;
			primaryRegistrationIndex: string;
			offeringUnitCode: string;
			registrationIndex: string;
			subjectCode: string;
		}[];
		sectionNotes: string;
		specialPermissionDropCode: string | null;
		crossListedSectionType: string;
		instructors: {
			name: string;
		}[];
		number: string;
		finalExam: string;
		majors: unknown[];
		openToText: string;
		openStatusText: string;
		sessionDates: string | null;
		specialPermissionDropCodeDescription: string | null;
		subtopic: string;
		openStatus: boolean;
		comments: {
			code: string;
			description: string;
		}[];
		instructorsText: string;
		minors: unknown[];
		examCodeText: string;
		campusCode: string;
		sectionCampusLocations: {
			code: string;
			description: string;
		}[];
		index: string;
		unitMajors: unknown[];
		printed: string;
		specialPermissionAddCodeDescription: string | null;
		commentsText: string;
		subtitle: string;
		crossListedSectionsText: string;
		sectionCourseType: string;
		meetingTimes: {
			campusLocation: string;
			roomNumber: string;
			campusAbbrev: string;
			campusName: string;
			startTimeMilitary: string;
			buildingCode: string;
			meetingModeDesc: string;
			endTimeMilitary: string;
			meetingModeCode: string;
			baClassHours: string;
			pmCode: string;
			meetingDay: string;
			startTime: string;
			endTime: string;
		}[];
		legendKey: null;
		honorPrograms: {
			code?: string;
		}[];
	}[];
	supplementCode: string;
	courseFee: string;
	unitNotes: string;
	courseNotes: string;
}

export interface CachedCourse {
	id: string;
	title: string;
	sections: { number: string; index: string }[];
}
