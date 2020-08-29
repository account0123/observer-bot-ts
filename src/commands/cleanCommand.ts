import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";

export class CleanCommand implements ArgCommand {
	commandNames: string[] = ['clean', 'purge', 'prune']
	requiredArgs: number = 1
	examples: string[] = ['30']
	usage: string= '<cantidad de mensajes a borrar>'
	guildExclusive: boolean = true
	async run(msg: Message, args: string[]): Promise<void> {
		const n = parseInt(args[0])
		if (isNaN(n)) {
			msg.reply('el número que ingresaste no es un número válido')
		}
		await msg.channel.bulkDelete(n, true).then((msgs)=>msg.channel.send(`${msgs.size} mensajes borrados`).then(m=>m.delete({timeout: 5000})).catch(e=>{msg.reply('No se pudieron borrar los mensajes por un error.')
		console.error(`Se intentó borrar ${n} mensajes pero no se pudo por ${e}`)
		console.error();})
		)	
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
			msg.reply('no tengo el permiso para borrar mensajes.')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
			msg.reply('no tienes permiso de borrar mensajes.')
			return false
		}
		return true
	}
}