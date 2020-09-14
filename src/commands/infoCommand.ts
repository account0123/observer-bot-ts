import { Message, MessageEmbed } from "discord.js";
import Command from "./commandInterface";
import { Lang } from "./lang/Lang";

export class InfoCommand implements Command {
	commandNames: string[] = ['info','about','bot']
	guildExclusive: boolean = false
	shortdescription: string = 'info.info.description'
	fulldescription: string = this.shortdescription
	private readonly version:string = 'v1.0.1'
	async run(msg: Message, l: Lang): Promise<void> {
		var color = 0xffffff
		if(msg.guild) color = msg.guild.member(msg.client.user!)!.displayColor
		const e = 'info.info.embed.'
		const t = await l.translate(e+'title')
		const language = await l.translate(e+'language')
		const lib = await l.translate(e+'library')
		const v = await l.translate(e+'version')
		const c = await l.translate(e+'changelog')
		const changes = await l.translate(e+'changes')
		const embed = new MessageEmbed().setTitle(t).addFields(
			{ name: language, value: '*TypeScript/JavaScript*', inline: true},
			{ name: lib		, value: 'discord.js'			  , inline: true},
			{ name: v		, value: this.version			  , inline: true},
			{ name: c		, value: changes}
		).setColor(color);
		await msg.channel.send(embed)
	}
}