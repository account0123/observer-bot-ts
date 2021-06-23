import Command from "./commandInterface";
import { Message, MessageEmbed } from "discord.js";
import { Connections } from "../config/connections";
import { Lang } from "./lang/Lang";
import { RowDataPacket } from "mysql2";

export class EditSnipeCommand implements Command {
	type: string | undefined;
	commandNames: string[] = ['editsnipe']
	guildExclusive: boolean = true
	shortdescription: string = 'info.editsnipe.description'
	fulldescription: string = 'info.editsnipe.fulldescription'
	async run(msg: Message, l: Lang): Promise<void> {
		const bot = msg.guild!.member(msg.client.user!)!
		const color = bot.displayColor
		const connection = Connections.db
		const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM edited WHERE channel=? and guild=?',[msg.channel.id, msg.guild!.id]);
		try {
			const row = rows[rows.length - 1]
			const footer = await l.translate('info.editsnipe.success')
			const embed = new MessageEmbed().setAuthor(row['username'],row['avatar_url']).setColor(color).setDescription(row['content']).setFooter(footer).setTimestamp(row['time']);
			msg.channel.send(embed).catch(e=>{
				l.reply('info.editsnipe.error')
				console.error(e.stack)
			});
		}catch (error) {
			throw error
		}
	}
}