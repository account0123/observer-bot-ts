import ArgCommand from "./commandArgInterface";
import { Message } from "discord.js";

export class SayCommand implements ArgCommand {
	permission: string = ''
	shortdescription: string = 'info.say.description'
	fulldescription: string = this.shortdescription
	async checkPermissions(msg: Message): Promise<boolean> {
		return true
	}
	commandNames: string[] = ['say', 'tell', 'speak']
	requiredArgs: number = 1
	examples: string[] = ['Hello world!!!','Hay pelotudos y luego estás tú']
	usage: string = 'info.say.usage'
	guildExclusive: boolean = false
	async run(msg: Message, args: string[]): Promise<void> {
		await msg.channel.send(args.join(' '))
		await msg.delete({timeout: 800,reason: 'Comando say ejecutado'})
	}
	
}