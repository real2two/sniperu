export function getDiscordAvatar({
	user,
	member,
	guildId,
}: {
	user?: { id: string; avatar?: string | null } | null;
	member?: { avatar?: string | null } | null;
	guildId?: string | null;
}) {
	if (!user) return undefined;

	let avatar = user.avatar
		? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
		: `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 6n}.png`;
	if (member?.avatar) {
		if (!guildId) throw new Error("Missing guild ID in getDiscordAvatar");
		avatar = `https://cdn.discordapp.com/guilds/${guildId}/users/${user.id}/avatars/${member.avatar}`;
	}
	return avatar;
}
