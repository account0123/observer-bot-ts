import { Message } from "discord.js";
import { RowDataPacket } from "mysql2";
import CommandHandler from "../commandHandler";
import { Connections } from "../config/connections";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class EnableCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['enable']
	guildExclusive: boolean = true
	shortdescription: string = 'info.enable.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.enable.usage'
	examples: string[] = ['snipe', 'say']
	permission: string = 'ADMINISTRATOR'
	type: string = 'config'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		// Verificación
		const input = args[0].toLowerCase()
		const c = CommandHandler.commands.find(command => command.commandNames.includes(input)) || CommandHandler.argCommands.find(command => command.commandNames.includes(input))
		if(!c){
			l.send('errors.invalid_command', input)
			return
		}
		const g_id = msg.guild!.id, c_id = msg.channel.id
        const [rows, f] = await Connections.db.execute<RowDataPacket[]>('SELECT command, global FROM disabled WHERE guild_id=?', [g_id])
		console.log(rows)
		for(const row of rows){
			if(row['command'] == c.commandNames[0]){
				//Ejecución
                if(!!row['global']){
                     Connections.db.execute('DELETE FROM disabled WHERE guild_id=? AND command=?', [g_id, c.commandNames[0]])
                     console.log("Comando habilitado globalmente")
                     l.send('info.enable.success', c.commandNames[0])
                     return
                }else{
                    Connections.db.execute('DELETE FROM disabled WHERE guild_id=? AND channel_id=? AND command=?', [g_id, c_id, c.commandNames[0]])
                    l.send('info.enable.success', c.commandNames[0])
                    return
                }
			}
		}
		l.send('info.enable.enabled')
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