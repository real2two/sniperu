/** biome-ignore-all lint/suspicious/noExplicitAny: allow any */

import {
	type APIApplicationCommandAutocompleteResponse,
	type APIInteractionGuildMember,
	type APIInteractionResponse,
	type APIInteractionResponseChannelMessageWithSource,
	type APIInteractionResponseUpdateMessage,
	type APIModalInteractionResponse,
	type APIUser,
	InteractionResponseType,
	InteractionType,
	type RESTPatchAPIWebhookWithTokenMessageJSONBody,
	type RESTPostAPIInteractionCallbackWithResponseResult,
	type RESTPostAPIInteractionFollowupJSONBody,
} from "discord-api-types/v10";
import { verifyKey } from "discord-interactions";
import type {
	AutocompleteInteraction,
	BaseInteraction,
	ComponentParserResult,
	Interaction,
	RespondOpts,
} from "../types/interaction";
import {
	createFollowUp,
	createInteraction,
	deleteWebhook,
	editWebhook,
} from "../utils/discord";
import { getModal } from "../utils/getModal";
import { getOptions } from "../utils/getOptions";
import { getRevolved } from "../utils/getRevolved";
import type { Command } from "./Command";
import type { CommandWithSubcommands } from "./CommandWithSubcommands";
import type { Component } from "./Component";

export class Client {
	id: string;
	publicKey: string;
	token: string;

	readonly commands: (Command | CommandWithSubcommands)[];
	readonly components: Component[];

	private _commandsSet: Map<string, Command | CommandWithSubcommands>;
	private _componentsSet: Map<string, Component>;

	constructor({
		id,
		publicKey,
		token,
		commands,
		components,
		customIdParser,
	}: {
		id: Client["id"];
		publicKey: Client["publicKey"];
		token: Client["token"];
		commands?: Client["commands"];
		components?: Client["components"];
		customIdParser?: Client["customIdParser"];
	}) {
		this.id = id;
		this.publicKey = publicKey;
		this.token = token;
		this.commands = commands ?? [];
		this.components = components ?? [];
		if (customIdParser) this.customIdParser = customIdParser;

		this._commandsSet = new Map(this.commands.map((c) => [c.name, c]));
		this._componentsSet = new Map(this.components.map((c) => [c.customId, c]));
	}

	customIdParser(customId: string): ComponentParserResult {
		const key = customId.split("?", 1)[0];
		if (!key) throw new Error("Missing key in custom ID");

		const args = customId.slice(key.length);
		const params = new URLSearchParams(args);

		return { key, params: Object.fromEntries(params.entries()) };
	}

	async handleInteractions(req: Request) {
		const signature = req.headers.get("x-signature-ed25519");
		const timestamp = req.headers.get("x-signature-timestamp");
		const body = await req.text();

		if (!signature || !timestamp) {
			return new Response("Bad request", { status: 400 });
		}

		const isValid = await verifyKey(body, signature, timestamp, this.publicKey);
		if (!isValid) return new Response("Invalid signature", { status: 401 });

		const interaction: BaseInteraction["interaction"] = JSON.parse(body);
		if (interaction.type === InteractionType.Ping) {
			return new Response(
				JSON.stringify({ type: InteractionResponseType.Pong }),
			);
		}

		let resolved = false;
		return new Promise<Response>((resolve) => {
			const resolvedTimeout = setTimeout(() => {
				if (resolved) return;

				resolved = true;
				return resolve(new Response(null, { status: 204 }));
			}, 3000);

			function respond<A extends boolean = false, R extends boolean = false>(
				data: APIInteractionResponse,
				opts?: RespondOpts<A, R>,
			) {
				if (resolved) throw new Error("Cannot respond to resolved request");

				resolved = true;
				clearTimeout(resolvedTimeout);

				return (
					opts?.awaitable
						? createInteraction(interaction, data as APIInteractionResponse, {
								withResponse: opts.withResponse || false,
							})
						: resolve(
								new Response(JSON.stringify(data), {
									headers: { "content-type": "application/json" },
								}),
							)
				) as A extends true
					? R extends true
						? Promise<RESTPostAPIInteractionCallbackWithResponseResult>
						: Promise<void>
					: undefined;
			}

			const member = interaction.member as APIInteractionGuildMember;
			const user = member?.user || (interaction.user as APIUser);
			const baseData: BaseInteraction = {
				interaction,
				appPermissions: interaction.app_permissions,
				data: interaction.data,

				guildId: interaction.guild_id,
				guild: interaction.guild,
				userId: user.id,
				user: user,
				member: member,
				channel: interaction.channel,

				createdId:
					interaction.message?.interaction_metadata?.user.id ?? user.id,

				opts: getOptions(interaction),
				modal: getModal(interaction),
				resolved: getRevolved(interaction),

				params: {},
			};

			const interactionData: Interaction = {
				...baseData,
				isAutocomplete: false,

				defer<A extends boolean = false, R extends boolean = false>(
					opts?: RespondOpts<A, R>,
				) {
					return respond(
						{ type: InteractionResponseType.DeferredChannelMessageWithSource },
						opts,
					);
				},
				deferMessageEdit<A extends boolean = false, R extends boolean = false>(
					opts?: RespondOpts<A, R>,
				) {
					return respond(
						{ type: InteractionResponseType.DeferredMessageUpdate },
						opts,
					);
				},
				deferMessageEditElseDeferReply<
					A extends boolean = false,
					R extends boolean = false,
				>(opts?: RespondOpts<A, R>) {
					if (interaction.message)
						return interactionData.deferMessageEdit(opts);
					return interactionData.defer(opts);
				},
				reply<A extends boolean = false, R extends boolean = false>(
					data: string | APIInteractionResponseChannelMessageWithSource["data"],
					opts?: RespondOpts<A, R>,
				) {
					const parsedData = (
						typeof data === "string" ? { content: data } : data
					) as APIInteractionResponseChannelMessageWithSource["data"];
					if (!parsedData.allowed_mentions) parsedData.allowed_mentions = {};

					return respond(
						{
							type: InteractionResponseType.ChannelMessageWithSource,
							data: parsedData,
						},
						opts,
					);
				},
				updateMessage<A extends boolean = false, R extends boolean = false>(
					data: string | APIInteractionResponseUpdateMessage["data"],
					opts?: RespondOpts<A, R>,
				) {
					const parsedData = (
						typeof data === "string" ? { content: data } : data
					) as APIInteractionResponseUpdateMessage["data"];

					if (parsedData) {
						if (!parsedData.content) parsedData.content = "";
						if (!parsedData.embeds) parsedData.embeds = [];
						if (!parsedData.components) parsedData.components = [];
						if (!parsedData.flags) parsedData.flags = 0 << 0;
						if (!parsedData.allowed_mentions) parsedData.allowed_mentions = {};
					}

					return respond(
						{
							type: InteractionResponseType.UpdateMessage,
							data: parsedData,
						},
						opts,
					);
				},
				updateMessageElseReply<
					A extends boolean = false,
					R extends boolean = false,
				>(
					data: string | APIInteractionResponseChannelMessageWithSource["data"],
					opts?: RespondOpts<A, R>,
				) {
					if (interaction.message) {
						return interactionData.updateMessage(data, opts);
					}
					return interactionData.reply(data, opts);
				},
				showModal<A extends boolean = false, R extends boolean = false>(
					data: APIModalInteractionResponse["data"],
					opts?: RespondOpts<A, R>,
				) {
					return respond(
						{
							type: InteractionResponseType.Modal,
							data: data as APIModalInteractionResponse["data"],
						},
						opts,
					);
				},

				editOriginal: (data) => {
					const parsedData =
						data as RESTPatchAPIWebhookWithTokenMessageJSONBody;
					if (!parsedData.allowed_mentions) parsedData.allowed_mentions = {};

					return editWebhook(interaction, "@original", parsedData);
				},
				deleteOriginal: () => deleteWebhook(interaction, "@original"),

				followUp: (data) => {
					const parsedData = data as RESTPostAPIInteractionFollowupJSONBody;
					if (!parsedData.allowed_mentions) parsedData.allowed_mentions = {};

					return createFollowUp(interaction, parsedData);
				},
				editFollowUp: (msgId, data) => {
					const parsedData =
						data as RESTPatchAPIWebhookWithTokenMessageJSONBody;

					if (parsedData) {
						if (!parsedData.content) parsedData.content = "";
						if (!parsedData.embeds) parsedData.embeds = [];
						if (!parsedData.components) parsedData.components = [];
						if (!parsedData.allowed_mentions) parsedData.allowed_mentions = {};
					}

					return editWebhook(interaction, msgId, parsedData);
				},
				deleteFollowUp: (messageId) => deleteWebhook(interaction, messageId),
			};

			const autocompleteData: AutocompleteInteraction = {
				...baseData,
				isAutocomplete: true,

				reply<A extends boolean = false, R extends boolean = false>(
					choices:
						| APIApplicationCommandAutocompleteResponse["data"]["choices"]
						| [],
					opts?: RespondOpts<A, R>,
				) {
					return respond(
						{
							type: InteractionResponseType.ApplicationCommandAutocompleteResult,
							data: { choices },
						},
						opts,
					);
				},
			};

			try {
				switch (interaction.type) {
					case InteractionType.ApplicationCommand:
					case InteractionType.ApplicationCommandAutocomplete: {
						// Handle global commands
						const command = this._commandsSet.get(interaction.data?.name);
						if (!command || command.type !== interaction.data?.type) return;

						// Handle application command
						if (interaction.type === InteractionType.ApplicationCommand) {
							return Promise.resolve(command.run(interactionData)).catch(
								console.error,
							);
						}

						// Handle application command autocomplete
						return Promise.resolve(
							command.autocomplete(autocompleteData),
						).catch(console.error);
					}
					case InteractionType.MessageComponent:
					case InteractionType.ModalSubmit: {
						const { key, params } = this.customIdParser(
							interaction.data.custom_id,
						);

						const component = this._componentsSet.get(key);
						if (!component) return;

						// Handle component / modal submit
						const componentData: Interaction = {
							...interactionData,
							params,
						};
						return Promise.resolve(component?.run(componentData)).catch(
							console.error,
						);
					}
				}
			} catch (err) {
				console.error(err);
			}
		});
	}

	/** Register commands into the bot */
	registerCommands(
		customParser = (commands: (Command | CommandWithSubcommands)[]) =>
			commands.map((c) => c.serialize()),
	) {
		return fetch(`https://discord.com/api/applications/${this.id}/commands`, {
			method: "put",
			headers: {
				authorization: `Bot ${this.token}`,
				"content-type": "application/json",
			},
			body: JSON.stringify(customParser(this.commands)),
		});
	}
}
