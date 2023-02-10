import Command from "./commandInterface";
import { EmbedBuilder, Message} from "discord.js";
import console from "console";
import { Connections } from "../config/connections";
import { Lang } from "./lang/Lang";
import { RowDataPacket } from "mysql2";
import { MemberFinder } from "../util/MemberFinder";

export class SnipeCommand implements Command {
	type: string | undefined;
	commandNames: string[] = ['snipe']
	guildExclusive = true
	shortdescription = 'info.snipe.description'
	fulldescription = 'info.snipe.fulldescription'
	async run(msg: Message, l: Lang): Promise<void> {
		if(!msg.guild || !msg.client.user) return
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!bot) return
		const color = bot.displayColor
		const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT * FROM deleted WHERE channel=? and guild=?',[msg.channel.id, msg.guild.id])
			if(rows.length == 0) {
				l.send('info.snipe.no_msg')
				return
			}
			const footer = await l.translate('info.snipe.success')
			const lastrow = rows[rows.length - 1]
			const embed = new EmbedBuilder().setAuthor({name: String(lastrow.username), iconURL: lastrow.avatar_url})
				.setColor(color).setDescription(lastrow.content)
				.setFooter({text: footer}).setTimestamp(lastrow.time)
			msg.channel.send({embeds: [embed]}).catch(e=>{
				l.reply('info.snipe.error')
				console.error(e.stack)
			})
	}
	
}