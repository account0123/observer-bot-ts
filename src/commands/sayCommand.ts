import ArgCommand from "./commandArgInterface";
import { Message } from "discord.js";

export class SayCommand implements ArgCommand {
	permission: string = ''
	shortdescription: string = 'El bot dice lo que quieras.'
	fulldescription: string = this.shortdescription
	async checkPermissions(msg: Message): Promise<boolean> {
		return true
	}
	commandNames: string[] = ['say', 'tell', 'speak']
	requiredArgs: number = 1
	examples: string[] = ['Hola mundo!!!','Hay pelotudos y luego estás tú']
	usage: string = '<palabra o frase>'
	guildExclusive: boolean = false
	async run(msg: Message, args: string[]): Promise<void> {
		await msg.channel.send(args.join(' '))
		await msg.delete({timeout: 1000,reason: 'comando say ejecutado'})
	}
	
}