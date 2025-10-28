/** biome-ignore-all lint/suspicious/noExplicitAny: allow any */

import type {
	APIApplicationCommandAutocompleteResponse,
	APIBaseInteraction,
	APIChannel,
	APIInteractionGuildMember,
	APIInteractionResponseChannelMessageWithSource,
	APIInteractionResponseUpdateMessage,
	APIModalInteractionResponse,
	APIPartialInteractionGuild,
	APIUser,
	InteractionType,
	RESTPatchAPIWebhookResult,
	RESTPatchAPIWebhookWithTokenMessageJSONBody,
	RESTPostAPIInteractionCallbackWithResponseResult,
	RESTPostAPIInteractionFollowupJSONBody,
	RESTPostAPIInteractionFollowupResult,
} from "discord-api-types/v10";
import type { getModal } from "../utils/getModal";
import type { getOptions } from "../utils/getOptions";
import type { getRevolved } from "../utils/getRevolved";

export type ComponentParserResult = {
	key: string;
	params: Record<string, string>;
};

export type RespondOpts<
	A extends boolean = false,
	R extends boolean = false,
> = A extends true
	? {
			awaitable: A;
			withResponse?: R;
		}
	: {
			awaitable?: A;
		};

export interface BaseInteraction {
	interaction: APIBaseInteraction<InteractionType, any>;
	appPermissions: APIBaseInteraction<InteractionType, any>["app_permissions"];
	data: any;

	guildId?: string;
	guild?: APIPartialInteractionGuild;
	userId: string;
	user: APIUser;
	member?: APIInteractionGuildMember;
	channel?: Partial<APIChannel> & Pick<APIChannel, "id" | "type">;

	/** This gets the user ID of whoever originally created the interaction */
	createdId: string;

	opts: ReturnType<typeof getOptions>;
	modal: ReturnType<typeof getModal>;
	resolved: ReturnType<typeof getRevolved>;

	/** Get params from components */
	params: ComponentParserResult["params"];
}

export interface Interaction extends BaseInteraction {
	isAutocomplete: false;

	defer: <A extends boolean = false, R extends boolean = false>(
		opts?: RespondOpts<A, R>,
	) => A extends true
		? R extends true
			? Promise<RESTPostAPIInteractionCallbackWithResponseResult>
			: Promise<void>
		: void;
	deferMessageEdit: <A extends boolean = false, R extends boolean = false>(
		opts?: RespondOpts<A, R>,
	) => A extends true
		? R extends true
			? Promise<RESTPostAPIInteractionCallbackWithResponseResult>
			: Promise<void>
		: void;
	deferMessageEditElseDeferReply: <
		A extends boolean = false,
		R extends boolean = false,
	>(
		opts?: RespondOpts<A, R>,
	) => A extends true
		? R extends true
			? Promise<RESTPostAPIInteractionCallbackWithResponseResult>
			: Promise<void>
		: void;
	reply: <A extends boolean = false, R extends boolean = false>(
		data: string | APIInteractionResponseChannelMessageWithSource["data"],
		opts?: RespondOpts<A, R>,
	) => A extends true
		? R extends true
			? Promise<RESTPostAPIInteractionCallbackWithResponseResult>
			: Promise<void>
		: void;
	updateMessage: <A extends boolean = false, R extends boolean = false>(
		data: string | APIInteractionResponseUpdateMessage["data"],
		opts?: RespondOpts<A, R>,
	) => A extends true
		? R extends true
			? Promise<RESTPostAPIInteractionCallbackWithResponseResult>
			: Promise<void>
		: void;
	updateMessageElseReply: <
		A extends boolean = false,
		R extends boolean = false,
	>(
		data: string | APIInteractionResponseChannelMessageWithSource["data"],
		opts?: RespondOpts<A, R>,
	) => A extends true
		? R extends true
			? Promise<RESTPostAPIInteractionCallbackWithResponseResult>
			: Promise<void>
		: void;
	showModal: <A extends boolean = false, R extends boolean = false>(
		data: APIModalInteractionResponse["data"],
		opts?: RespondOpts<A, R>,
	) => A extends true
		? R extends true
			? Promise<RESTPostAPIInteractionCallbackWithResponseResult>
			: Promise<void>
		: void;

	editOriginal: (
		data: RESTPatchAPIWebhookWithTokenMessageJSONBody,
	) => Promise<RESTPatchAPIWebhookResult>;
	deleteOriginal: () => Promise<void>;

	followUp: (
		data: RESTPostAPIInteractionFollowupJSONBody,
	) => Promise<RESTPostAPIInteractionFollowupResult>;
	editFollowUp: (
		messageId: string,
		data: RESTPatchAPIWebhookWithTokenMessageJSONBody,
	) => Promise<RESTPatchAPIWebhookResult>;
	deleteFollowUp: (messageId: string) => Promise<void>;
}

export interface AutocompleteInteraction extends BaseInteraction {
	isAutocomplete: true;

	reply: <A extends boolean = false, R extends boolean = false>(
		choices: APIApplicationCommandAutocompleteResponse["data"]["choices"] | [],
		opts?: RespondOpts<A, R>,
	) => A extends true
		? R extends true
			? Promise<RESTPostAPIInteractionCallbackWithResponseResult>
			: Promise<void>
		: void;
}
