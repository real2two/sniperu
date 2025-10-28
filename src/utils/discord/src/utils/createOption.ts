import type {
	APIApplicationCommandBasicOption,
	APIApplicationCommandIntegerOption,
	APIApplicationCommandNumberOption,
	APIApplicationCommandOptionChoice,
	APIApplicationCommandStringOption,
} from "discord-api-types/v10";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export function createOption<T extends ApplicationCommandOptionType>(type: T) {
	type OptionData<D extends APIApplicationCommandBasicOption> = Omit<
		D,
		"type" | "name" | "description" | "options"
	> & {
		name?: string;
		description?: string;
		required?: boolean;
	};

	type OptionConstructor<
		D extends APIApplicationCommandBasicOption & { type: T },
	> = string | OptionData<D>;

	class Option<D extends APIApplicationCommandBasicOption & { type: T }> {
		type = type;
		data: OptionData<D>;

		constructor(data?: OptionConstructor<D>) {
			this.data =
				!data || typeof data === "string"
					? ({
							name: undefined,
							description: data ?? "No description has been set",
							required: false,
						} as Option<D>["data"])
					: {
							...data,
							description: data.description ?? "No description has been set",
						};
		}

		min(min: number) {
			if (this.type === ApplicationCommandOptionType.String) {
				const data = this.data as OptionData<APIApplicationCommandStringOption>;
				data.min_length = min;
			} else if (
				[
					ApplicationCommandOptionType.Integer,
					ApplicationCommandOptionType.Number,
				].includes(this.type)
			) {
				const data = this.data as OptionData<
					APIApplicationCommandIntegerOption | APIApplicationCommandNumberOption
				>;
				data.min_value = min;
			} else {
				throw new Error(
					"You can only use min() in a string, integer or number",
				);
			}
			return this;
		}

		max(max: number) {
			if (this.type === ApplicationCommandOptionType.String) {
				const data = this.data as OptionData<APIApplicationCommandStringOption>;
				data.max_length = max;
			} else if (
				[
					ApplicationCommandOptionType.Integer,
					ApplicationCommandOptionType.Number,
				].includes(this.type)
			) {
				const data = this.data as OptionData<
					APIApplicationCommandIntegerOption | APIApplicationCommandNumberOption
				>;
				data.max_value = max;
			} else {
				throw new Error(
					"You can only use max() in a string, integer or number",
				);
			}
			return this;
		}

		choices(
			choices:
				| APIApplicationCommandOptionChoice<string>[]
				| APIApplicationCommandOptionChoice<number>[],
		) {
			if (
				[
					ApplicationCommandOptionType.String,
					ApplicationCommandOptionType.Integer,
					ApplicationCommandOptionType.Number,
				].includes(this.type)
			) {
				const data = this.data as OptionData<
					| APIApplicationCommandStringOption
					| APIApplicationCommandIntegerOption
					| APIApplicationCommandNumberOption
				>;
				data.choices = choices;
			} else {
				throw new Error(
					"You can only use choices() in a string, integer or number",
				);
			}
			return this;
		}

		autocomplete(autocomplete = true) {
			if (
				![
					ApplicationCommandOptionType.String,
					ApplicationCommandOptionType.Integer,
					ApplicationCommandOptionType.Number,
				].includes(this.type)
			)
				throw new Error(
					"You can only use autocomplete() in a string, integer or number",
				);

			const data = this.data as OptionData<
				APIApplicationCommandIntegerOption | APIApplicationCommandNumberOption
			>;
			data.autocomplete = autocomplete;
			return this;
		}

		required(required = true) {
			this.data.required = required;
			return this;
		}

		serialize() {
			return { ...this.data, type: this.type } as D;
		}
	}

	return <D extends APIApplicationCommandBasicOption & { type: T }>(
		data?: OptionConstructor<D>,
	) => new Option<D>(data);
}

export function createOptions() {
	return {
		attachment: createOption(ApplicationCommandOptionType.Attachment),
		boolean: createOption(ApplicationCommandOptionType.Boolean),
		channel: createOption(ApplicationCommandOptionType.Channel),
		integer: createOption(ApplicationCommandOptionType.Integer),
		mentionable: createOption(ApplicationCommandOptionType.Mentionable),
		number: createOption(ApplicationCommandOptionType.Number),
		role: createOption(ApplicationCommandOptionType.Role),
		string: createOption(ApplicationCommandOptionType.String),
		user: createOption(ApplicationCommandOptionType.User),
	};
}
