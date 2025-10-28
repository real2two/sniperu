/** biome-ignore-all lint/suspicious/noExplicitAny: allow any */

import type {
	APIBaseInteraction,
	APIInteractionResponse,
	InteractionType,
	RESTPatchAPIWebhookResult,
	RESTPatchAPIWebhookWithTokenMessageJSONBody,
	RESTPostAPIChannelMessageJSONBody,
	RESTPostAPIInteractionCallbackWithResponseResult,
	RESTPostAPIInteractionFollowupJSONBody,
	RESTPostAPIInteractionFollowupResult,
} from "discord-api-types/v10";
import { fetchAndRetry } from "./fetchAndRetry";

export async function createInteraction<R extends boolean = false>(
	interaction: APIBaseInteraction<InteractionType, any>,
	data: APIInteractionResponse,
	opts?: { withResponse?: R },
) {
	const res = await fetchAndRetry(
		`https://discord.com/api/v10/interactions/${encodeURIComponent(interaction.id)}/${encodeURIComponent(interaction.token)}/callback?with_response=${opts?.withResponse === true ? "true" : "false"}`,
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(data),
		},
	);

	if (!res.ok) {
		console.error(
			"Failed to respond to interaction",
			res.status,
			await res.text(),
		);
		throw new Error("Failed to respond to interaction");
	}

	return (await res.json()) as R extends true
		? RESTPostAPIInteractionCallbackWithResponseResult
		: undefined;
}

export async function createFollowUp(
	interaction: APIBaseInteraction<InteractionType, any>,
	data: RESTPostAPIInteractionFollowupJSONBody,
) {
	const res = await fetchAndRetry(
		`https://discord.com/api/v10/webhooks/${encodeURIComponent(interaction.application_id)}/${encodeURIComponent(interaction.token)}`,
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(data),
		},
	);

	if (!res.ok) {
		console.error(
			"Failed to create follow up response",
			res.status,
			await res.text(),
		);
		throw new Error("Failed to create follow up response");
	}

	return (await res.json()) as RESTPostAPIInteractionFollowupResult;
}

export async function editWebhook(
	interaction: { application_id: string; token: string },
	messageId: string,
	data: RESTPatchAPIWebhookWithTokenMessageJSONBody,
) {
	const res = await fetchAndRetry(
		`https://discord.com/api/v10/webhooks/${encodeURIComponent(interaction.application_id)}/${encodeURIComponent(interaction.token)}/messages/${messageId === "@original" ? "@original" : encodeURIComponent(messageId)}`,
		{
			method: "PATCH",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(data),
		},
	);

	if (!res.ok) {
		console.error("Failed to edit a webhook", res.status, await res.text());
		throw new Error("Failed to edit a webhook");
	}

	return (await res.json()) as RESTPatchAPIWebhookResult;
}

export async function deleteWebhook(
	interaction: { application_id: string; token: string },
	messageId: string,
) {
	const res = await fetchAndRetry(
		`https://discord.com/api/v10/webhooks/${encodeURIComponent(interaction.application_id)}/${encodeURIComponent(interaction.token)}/messages/${messageId === "@original" ? "@original" : encodeURIComponent(messageId)}`,
		{
			method: "DELETE",
			headers: { "content-type": "application/json" },
		},
	);

	if (!res.ok) {
		console.error("Failed to delete a webhook", res.status, await res.text());
		throw new Error("Failed to delete a webhook");
	}
}

export async function createDmUser(userId: string, botToken: string) {
	const res = await fetchAndRetry(
		"https://discord.com/api/v10/users/@me/channels",
		{
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ recipient_id: userId }),
		},
	);

	if (!res.ok) {
		console.error("Failed to create DM channel", userId);
		throw new Error("Failed to create DM channel");
	}

	return res.json() as Promise<{ id: string }>;
}

export async function sendDm(
	userId: string,
	message: string | RESTPostAPIChannelMessageJSONBody,
	botToken: string,
) {
	const channel = await createDmUser(userId, botToken);
	const res = await fetchAndRetry(
		`https://discord.com/api/v10/channels/${channel.id}/messages`,
		{
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(
				typeof message === "string" ? { content: message } : message,
			),
		},
	);

	if (!res.ok) {
		console.error("Failed to send DM", userId);
		throw new Error("Failed to send DM");
	}

	return res.json();
}
