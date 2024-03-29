import ArgCommand from "../commandArgInterface";
import { Message } from "discord.js";
import { Connections } from "../../config/connections";
import { Lang } from "./Lang";
import { RowDataPacket } from "mysql2";
import { MemberFinder } from "../../util/MemberFinder";

export class LangCommand implements ArgCommand {
	requiredArgs = 0
	commandNames: string[] = ['lang']
	guildExclusive = true
	shortdescription = 'info.lang.description'
	fulldescription = 'info.lang.fulldescription'
	usage= 'info.lang.usage'
	examples: string[] = ['', 'es']
	permission = 'ADMINISTRATOR'
	type = 'config'
	async run(msg: Message, l: Lang,args: string[]): Promise<void> {
		const sql = Connections.db
		const g = msg.guild
		if(!g) return
		if (args.length == 0) {
			const [rows] = await sql.execute<RowDataPacket[]>('SELECT language FROM guilds WHERE id=?',[g.id])
				if(rows.length === 0) {
					sql.query('INSERT INTO guilds VALUES(?,?,?,?);',[g.id,g.name,'!!','en'])
					msg.reply('the actual language is english.')
					return
				}
				const row = rows[0]
				switch (row.language) {
					case 'es':
						msg.reply('el lenguaje actual es español.')
						break
					case 'en':
						msg.reply('the actual language is english.')
						break
				}
		}else{
			const language = args[0].toLowerCase().trim()
			switch (language) {
				case 'es':
					sql.query('UPDATE guilds SET language=\'es\' WHERE id=?',[g.id])
					msg.channel.send('Ahora mi idioma es español, ostia.')
					break;
				case 'en':
					sql.query('UPDATE guilds SET language=\'en\'WHERE id=?',[g.id])
					msg.channel.send('My language is english rn, nice.')
					break;
			}
		}
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild) return false
		const mod = MemberFinder.getMember(msg.guild, msg.author.id)
		if (!mod?.permissions.has('Administrator')){
			l.reply('errors.modperms.admin')
			return false
		}
		return true
	}
	
}