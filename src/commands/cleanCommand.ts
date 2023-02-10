import ArgCommand from "./commandArgInterface";
import { GuildTextBasedChannel, Message} from "discord.js";
import { Lang } from "./lang/Lang";
import { MemberFinder } from "../util/MemberFinder";

export class CleanCommand implements ArgCommand {
	permission = 'MANAGE_MESSAGES'
	shortdescription = 'info.clean.description'
	fulldescription: string = this.shortdescription
	commandNames: string[] = ['clean', 'purge', 'prune']
	requiredArgs = 1
	examples: string[] = ['30']
	usage= 'info.clean.usage'
	guildExclusive = true
	type = 'mod'
	async run(msg: Message,l: Lang, args: string[]): Promise<void> {
		const n = parseInt(args[0])
		if (isNaN(n)) {
			l.reply('errors.NaN',args[0])
		}
		const c = <GuildTextBasedChannel>msg.channel
		// Verificación
		if(!msg.client.user) return
		const mod = MemberFinder.getMember(c.guild, msg.author.id)
		const bot = MemberFinder.getMember(c.guild, msg.client.user.id)
		if(!mod || !bot) return
		if(!bot.permissionsIn(c).has('ManageMessages')) {
			l.reply('errors.botperms.clean')
			return
		}
		if(!mod.permissionsIn(c).has('ManageMessages')) {
			l.reply('errors.modperms.clean')
			return
		}
		// Acción
		c.bulkDelete(n, true)
			.then((msgs)=>l.send('info.clean.success','' + msgs.size)
			.then(m=>setTimeout(m.delete, 5000))
			.catch(e=>{
				if(e.code == 50016) l.send('info.clean.50016')
				else l.send('info.clean.error',e)
				console.error(`Se intentó borrar ${n} mensajes pero no se pudo por ${e.stack}`)
		})
		)	
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
}