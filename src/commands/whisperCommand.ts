import { Message } from "discord.js";
import { UserFinder } from "../util/UserFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class WhisperCommand implements ArgCommand {
	requiredArgs: number = 2
	commandNames: string[] = ['whisper', 'tell']
	guildExclusive: boolean = false
	shortdescription: string = 'info.whisper.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.whisper.usage'
	examples: string[] = ['hiiii', 'this message is secret']
	permission: string = ''
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const mention = args.shift()!
		const user = UserFinder.getUser(msg, mention)
		if(!user){
			l.reply('errors.invalid_user',mention)
			return
		}
		// No recolecto información sobre tu mensaje
		user.send(msg.author.tag + ' sent you: *' + args.join(' ') + '*').then(()=>console.log('Mensaje entregado')).catch(err=>{
			if(err.code === 50007) l.reply('errors.dm_closed')
			else l.reply('errors.unknown')
		});
	}
	checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		return Promise.resolve(true)
	}
	
}