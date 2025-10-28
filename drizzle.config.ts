import { defineConfig } from "drizzle-kit";
import { PG_URL } from "./src/env";

export default defineConfig({
	schema: "./schema/**/*",
	dialect: "postgresql",
	dbCredentials: { url: PG_URL },
});
