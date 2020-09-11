import Command from "./commandInterface";
import { Message, MessageEmbed } from "discord.js";
import console from "console";
import { Connections } from "../config/connections";
import { Lang } from "./lang/Lang";

export class SnipeCommand implements Command {
	commandNames: string[] = ['snipe']
	guildExclusive: boolean = true
	shortdescription: string = 'info.snipe.description'
	fulldescription: string = 'info.snipe.fulldescription'
	async run(msg: Message, l: Lang): Promise<void> {
		const bot = msg.guild!.member(msg.client.user!)!
		const color = bot.displayColor
		const connection = Connections.db
		connection.query('SELECT * FROM deleted WHERE channel=? and guild=?',[msg.channel.id, msg.guild!.id],function (err:any, rows) {
			if(err) throw err
			if(rows.length == 0) {
				l.send('info.snipe.no_msg')
				return
			}
			const lastrow = rows[rows.length - 1]
			const embed = new MessageEmbed().setAuthor(lastrow.username,lastrow.avatar_url).setColor(color).setDescription(lastrow.content).setFooter(l.translate('info.snipe.success')).setTimestamp(lastrow.time);
			msg.channel.send(embed).catch(e=>{
				msg.reply(l.translate('info.snipe.error'))
				console.error(e.stack)
			});
		})
	}
	
}