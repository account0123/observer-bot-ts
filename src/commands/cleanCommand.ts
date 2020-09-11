import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { Lang } from "./lang/Lang";

export class CleanCommand implements ArgCommand {
	permission: string = 'MANAGE_MESSAGES'
	shortdescription: string = 'info.clean.description'
	fulldescription: string = this.shortdescription
	commandNames: string[] = ['clean', 'purge', 'prune']
	requiredArgs: number = 1
	examples: string[] = ['30']
	usage: string= 'info.clean.usage'
	guildExclusive: boolean = true
	async run(msg: Message,l: Lang, args: string[]): Promise<void> {
		const n = parseInt(args[0])
		if (isNaN(n)) {
			l.reply('errors.NaN',args[0])
		}
		await msg.channel.bulkDelete(n, true).then((msgs)=>l.send('info.clean.success','' + msgs.size).then(m=>m.delete({timeout: 5000})).catch(e=>{
		if(e.code == 50016) l.send('info.clean.50016')
		else l.reply('info.clean.error',e)
		console.error(`Se intentó borrar ${n} mensajes pero no se pudo por ${e.stack}`)
		})
		)	
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
			l.reply('errors.botperms.clean')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
			l.reply('errors.modperms.clean')
			return false
		}
		return true
	}
}