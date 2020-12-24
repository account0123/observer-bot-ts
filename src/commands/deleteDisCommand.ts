import { DMChannel, Message } from "discord.js";
import Command from "./commandInterface";
import { Lang } from "./lang/Lang";

export class DeleteDisCommand implements Command {
	commandNames: string[] = ['deletedis', 'deletethis', 'supr']
	guildExclusive: boolean = false
	shortdescription: string = 'info.deletedis.description'
	fulldescription: string = this.shortdescription
	permission: string = ''
	async run(msg: Message, l: Lang): Promise<void> {
		if(msg.channel instanceof DMChannel) return
		await msg.channel.bulkDelete(2)
	}
	
}