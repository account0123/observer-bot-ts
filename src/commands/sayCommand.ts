import ArgCommand from "./commandArgInterface";
import { Message } from "discord.js";

export class SayCommand implements ArgCommand {
	commandNames: string[] = ['say', 'tell', 'speak']
	requiredArgs: number = 1
	examples: string[] = ['Hola mundo!!!','Hay pelotudos y luego estás tú']
	usage: string = '<palabra o frase>'
	guildExclusive: boolean = false
	async run(msg: Message, args: string[]): Promise<void> {
		await msg.channel.send(args.join(' ')).then(m=>m.delete({reason: 'comando say ejecutado'}))
	}
	
}