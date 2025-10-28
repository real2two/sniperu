import {
	ApplicationIntegrationType,
	// ButtonStyle,
	// ComponentType,
	InteractionContextType,
} from "discord-api-types/v10";
import { Command, type Interaction } from "$utils/discord";

export class HelpCommand extends Command {
	name = "help";

	override integration_types = [ApplicationIntegrationType.UserInstall];
	override contexts = [InteractionContextType.BotDM];

	async run({ reply }: Interaction) {
		reply({
			content: "Hello world!",
			// components: [
			// 	{
			// 		type: ComponentType.ActionRow,
			// 		components: [
			// 			{
			// 				type: ComponentType.Button,
			// 				style: ButtonStyle.Primary,
			// 				custom_id: "test",
			// 				label: "test component",
			// 			},
			// 		],
			// 	},
			// ],
		});
	}
}
