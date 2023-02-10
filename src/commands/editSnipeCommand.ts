import Command from "./commandInterface";
import { EmbedBuilder, Message } from "discord.js";
import { Connections } from "../config/connections";
import { Lang } from "./lang/Lang";
import { RowDataPacket } from "mysql2";
import { MemberFinder } from "../util/MemberFinder";

export class EditSnipeCommand implements Command {
	type: string | undefined;
	commandNames: string[] = ['editsnipe']
	guildExclusive = true
	shortdescription = 'info.editsnipe.description'
	fulldescription = 'info.editsnipe.fulldescription'
	async run(msg: Message, l: Lang): Promise<void> {
		if(!msg.guild || !msg.client.user) return
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!bot) return
		const color = bot.displayColor
		const connection = Connections.db
		const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM edited WHERE channel=? and guild=?',[msg.channel.id, msg.guild.id]);
		const lastrow = rows[rows.length - 1]
		const footer = await l.translate('info.editsnipe.success')
		const embed = new EmbedBuilder().setAuthor({name: String(lastrow.username), iconURL: lastrow.avatar_url})
			.setColor(color).setDescription(lastrow.content)
			.setFooter({text: footer}).setTimestamp(lastrow.time)
		msg.channel.send({embeds: [embed]}).catch(e=>{
				l.reply('info.editsnipe.error')
				console.error(e.stack)
			});
	}
}