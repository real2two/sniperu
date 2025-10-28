import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import type { Campus, Term } from "$utils/soc";

export const snipeRequests = pgTable(
	"snipe_requests",
	{
		userId: text("user_id").notNull(),

		year: integer("year").notNull(),
		term: text("term").$type<Term>().notNull(),
		campus: text("campus").$type<Campus>().notNull(),

		courseIndex: text("course_index").notNull(),
	},
	(table) => [
		primaryKey({
			columns: [
				table.userId,
				table.year,
				table.term,
				table.campus,
				table.courseIndex,
			],
		}),
	],
);
