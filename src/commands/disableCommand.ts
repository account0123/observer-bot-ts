import { Message } from "discord.js";
import { RowDataPacket } from "mysql2";
import CommandHandler from "../commandHandler";
import { Connections } from "../config/connections";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class DisableCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['disable']
	guildExclusive: boolean = true
	shortdescription: string = 'info.disable.description'
	fulldescription: string = 'info.disabled.fulldescription'
	usage: string = 'info.disable.usage'
	examples: string[] = ['snipe', 'say', 'globally roleinfo']
	permission: string = 'ADMINISTRATOR'
	type: string = 'config'
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
			l.send('info.disabled.forbidden')
			return
		}
		const g_id = msg.guild!.id, c_id = msg.channel.id
		const [rows, fields] = await Connections.db.execute<RowDataPacket[]>('SELECT command FROM disabled WHERE guild_id=? AND channel_id=?', [g_id, c_id])
		console.log(rows)
		for(const row of rows){
			if(row['command'] == c.commandNames[0]){
				l.send('info.disable.disabled')
				return
			}
		}
		//Ejecución
		if(global) Connections.db.execute('INSERT INTO disabled VALUES (?, ?, ?)', [g_id, 'all', c.commandNames[0]])
		else Connections.db.execute('INSERT INTO disabled VALUES (?, ?, ?)', [g_id, c_id, c.commandNames[0]])
		// Éxito
		if(global) l.send('info.disable.global-success', c.commandNames[0])
		else l.send('info.disable.success', c.commandNames[0])
	}

	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		if (!mod.hasPermission(8)) {
			l.reply('errors.modperms.admin')
			return false
		}
		return true
	}
}