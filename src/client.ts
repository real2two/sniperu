import { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_PUBLIC_KEY } from "$env";
import { commands, components } from "./imports";
import { Client } from "./utils/discord/src";

export const client = new Client({
	id: DISCORD_CLIENT_ID,
	publicKey: DISCORD_PUBLIC_KEY,
	token: DISCORD_BOT_TOKEN,

	commands,
	components,
});
