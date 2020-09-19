import { Message } from "discord.js";
import Command from "./commandInterface";
import { Lang } from "./lang/Lang";

export class CancelCommand implements Command {
	commandNames: string[] = ['cancel']
	guildExclusive: boolean = true
	shortdescription: string = 'info.cancel.description'
	fulldescription: string = this.shortdescription
	static timeout: NodeJS.Timeout | undefined
	async run(msg: Message, l: Lang): Promise<void> {
		if(!msg.guild!.member(msg.author)!.hasPermission('BAN_MEMBERS')){
			l.send('nice_try')
			return
		}
		if(CancelCommand.timeout){
			clearTimeout(CancelCommand.timeout)
			CancelCommand.timeout = undefined
			l.send('canceled')
		}else{
			l.send('nothing_to_cancel')
		}
	}
}