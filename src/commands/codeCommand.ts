import { Message } from "discord.js";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class CodeCommand implements ArgCommand {
	type: string | undefined;
	requiredArgs = 1
	commandNames: string[] = ['code','unformat']
	guildExclusive = false
	shortdescription = 'info.code.description'
	fulldescription: string = this.shortdescription
	usage = 'info.code.usage'
	examples: string[] = ['123456789987654321']
	permission = ''
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const id = args[0]
		const message = msg.channel.messages.resolve(id)
		if(!message){
			l.reply('errors.invalid_message',id)
			return
		}
		await msg.channel.send('```' + message.content + '```')
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
	
}