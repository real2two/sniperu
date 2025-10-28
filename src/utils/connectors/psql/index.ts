import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { PG_URL } from "$env";
import * as schema from "./schema";

const client = new SQL(PG_URL);
export const db = drizzle(client, { schema });
