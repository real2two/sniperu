CREATE TABLE "snipe_requests" (
	"user_id" text NOT NULL,
	"year" integer NOT NULL,
	"term" text NOT NULL,
	"campus" text NOT NULL,
	"course_index" text NOT NULL,
	CONSTRAINT "snipe_requests_user_id_year_term_campus_course_index_pk" PRIMARY KEY("user_id","year","term","campus","course_index")
);
