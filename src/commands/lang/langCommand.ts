import ArgCommand from "../commandArgInterface";
import { Message } from "discord.js";
import { Connections } from "../../config/connections";

export class LangCommand implements ArgCommand {
	requiredArgs: number = 0
	commandNames: string[] = ['lang']
	guildExclusive: boolean = true
	shortdescription: string = 'Idioma en el que escribo'
	fulldescription: string = 'Muestra o cambia el idioma en el que escribo (solo `en` (inglés) y `es` (español) disponibles)'
	usage: string = '[idioma a cambiar]'
	examples: string[] = ['', 'es']
	permission: string = 'Administrador'
	async run(msg: Message, args: string[]): Promise<void> {
		const sql = Connections.db
		const g = msg.guild!
		if (args.length == 0) {
			sql.query('SELECT language FROM guilds WHERE id=?',[g.id],function(err,rows,fields){
				if(err) throw err
				if(rows.length === 0) {
					msg.reply('el idioma actual es español')
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
			});
		}else{
			const language = args[0].toLowerCase().trim()
			switch (language) {
				case 'es':
					sql.query('UPDATE guilds SET language=\'es\'')
					msg.channel.send('Ahora mi idioma es español, ostia.')
					break;
				case 'en':
					sql.query('UPDATE guilds SET language=\'en\'')
					msg.channel.send('My language is english rn, nice.')
					break;
			}
		}
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		if (!mod.hasPermission(8)){
			msg.channel.send('Comando reservado para administradores.')
			return false
		}
		return true
	}
	
}