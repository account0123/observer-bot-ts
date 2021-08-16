import { Message } from "discord.js";
import { RowDataPacket } from "mysql2";
import CommandHandler from "../commandHandler";
import { Connections } from "../config/connections";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class DisableCommand implements ArgCommand {
	requiredArgs = 1
	commandNames: string[] = ['disable']
	guildExclusive = true
	shortdescription = 'info.disable.description'
	fulldescription = 'info.disabled.fulldescription'
	usage = 'info.disable.usage'
	examples: string[] = ['snipe', 'say', 'globally roleinfo']
	permission = 'ADMINISTRATOR'
	type = 'config'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		// Verificación
		const global = args[0].toLowerCase() == 'globally'
		const input = args.length > 1 && global ? args[1].toLowerCase() : args[0].toLowerCase()
		const c = CommandHandler.commands.find(command => command.commandNames.includes(input)) || CommandHandler.argCommands.find(command => command.commandNames.includes(input))
		if(!c){
			l.send('errors.invalid_command', input)
			return
		}
		if(c.type == 'config'){
			l.send('info.disable.forbidden')
			return
		}
		if(!msg.guild) return
		const g_id = msg.guild.id
		const c_id = msg.channel.id
		const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT command, channel_id, global FROM disabled WHERE guild_id=?', [g_id])
		console.log(rows)
		for(const row of rows){
			if(row['command'] == c.commandNames[0]){
                if(row['global']){
                    l.send('info.disable.disabled')
                    return
                }else if(row['channel_id'] == c_id){
                    l.send('info.disable.disabled')
                    return
                }
			}
		}
		//Ejecución
		Connections.db.execute('INSERT INTO disabled VALUES (?, ?, ?, ?)', [g_id, g_id, c.commandNames[0], global ? 1 : 0])
		// Éxito
		if(global) l.send('info.disable.global-success', c.commandNames[0])
		else l.send('info.disable.success', c.commandNames[0])
	}

	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const mod = msg.guild.member(msg.author)
		if(!mod) return false
		if (!mod.hasPermission(8)) {
			l.reply('errors.modperms.admin')
			return false
		}
		return true
	}
}