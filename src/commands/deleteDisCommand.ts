import { DMChannel, Message } from "discord.js";
import Command from "./commandInterface";

export class DeleteDisCommand implements Command {
	type: string | undefined;
	commandNames: string[] = ['deletedis', 'deletethis', 'supr']
	guildExclusive = false
	shortdescription = 'info.deletedis.description'
	fulldescription: string = this.shortdescription
	permission = ''
	async run(msg: Message): Promise<void> {
		if(msg.channel instanceof DMChannel) return
		await msg.channel.bulkDelete(2)
	}
	
}