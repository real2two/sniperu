import { snipeHandler } from "$handlers";
import { Component, type Interaction } from "$utils/discord";
import type { Campus, Term } from "$utils/soc";

export class TestComponent extends Component {
	customId = "snipe";
	async run(interaction: Interaction) {
		const { params } = interaction;
		const { year, term, campus, courseIndex } = params;

		snipeHandler.run(interaction, {
			year: Number.parseInt(year as string, 10),
			term: term as Term,
			campus: campus as Campus,
			courseIndex: courseIndex as string,
		});
	}
}
