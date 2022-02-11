import { GuildTextBasedChannel, Message } from "discord.js";
import Command from "./commandInterface";

export class DeleteDisCommand implements Command {
	type: string | undefined;
	commandNames: string[] = ['deletedis', 'deletethis', 'supr']
	guildExclusive = false
	shortdescription = 'info.deletedis.description'
	fulldescription: string = this.shortdescription
	permission = ''
	async run(msg: Message): Promise<void> {
		const c = <GuildTextBasedChannel>msg.channel
		c.bulkDelete(2)
	}
	
}