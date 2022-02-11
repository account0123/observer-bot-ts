import { Message, MessageEmbed } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import Command from "./commandInterface";
import { Lang } from "./lang/Lang";

export class InfoCommand implements Command {
	commandNames: string[] = ['info','about','bot']
	guildExclusive = false
	shortdescription = 'info.info.description'
	fulldescription: string = this.shortdescription
	type = 'info'
	// cada arreglo de bug es una letra (a, b, c, d...)
	// cada nuevo día de creación de comandos es un número terciario (v1.1.0, v1.1.1, v1.1.2)
	// cada nuevo mecanismo, por ejemplo seguridad o database es un número secundario (v1.1, v1.2, v1.3...)
	// cada nueva "versión" del bot será un número primario (v1, v2, v3...)
	private readonly version:string = 'v1.3.5'
	async run(msg: Message, l: Lang): Promise<void> {
		let color = 0xffffff
		if(msg.guild && msg.client.user){
			const m = MemberFinder.getMember(msg, msg.client.user.id)
			if(m) color = m.displayColor
		}
		const e = 'info.info.embed.'
		const [t, language, lib, v ,c, changes] = await Promise.all([
			l.translate(e+'title'), l.translate(e+'language'), l.translate(e+'library'),
			l.translate(e+'version'), l.translate(e+'changelog'), l.translate(e+'changes')
		]);
		const embed = new MessageEmbed().setTitle(t).addFields(
			{ name: language, value: '*TypeScript/JavaScript*', inline: true},
			{ name: lib		, value: 'discord.js'			  , inline: true},
			{ name: v		, value: this.version			  , inline: true},
			{ name: c		, value: changes}
		).setColor(color);
		await msg.channel.send({embeds:[embed]})
	}
}