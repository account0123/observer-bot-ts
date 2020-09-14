import { Message } from "discord.js";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class FormatCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['format','f']
	guildExclusive: boolean = false
	shortdescription: string = 'info.format.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.format.usage'
	examples: string[] = ['Hi everyone\\nThis is another line','\\t<- there\'s a big space here.']
	permission: string = ''
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const c = args.join(' ')
		const f = c.replace('\\n','\n').replace('\\t','\t').replace('\\r','\r').replace('\\b','\b').replace('\\v','\v').replace('\\0','\0').replace('\\f','\f')
		await msg.channel.send(f)
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
}