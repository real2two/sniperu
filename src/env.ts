export const PORT = Number.parseInt(process.env.PORT, 10);
export const {
	PG_URL,
	DISCORD_CLIENT_ID,
	DISCORD_PUBLIC_KEY,
	DISCORD_BOT_TOKEN,
} = process.env;

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string;
			PG_URL: string;
			DISCORD_CLIENT_ID: string;
			DISCORD_PUBLIC_KEY: string;
			DISCORD_BOT_TOKEN: string;
		}
	}
}
