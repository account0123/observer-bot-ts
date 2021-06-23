import { Message } from "discord.js";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";
import { RAE } from "rae-api";
export class RAECommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['rae', 'definir', 'buscar']
	guildExclusive: boolean = false
	shortdescription: string = 'info.rae.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.rae.usage'
	examples: string[] = ['hola', 'meme']
	permission: string = ''
	type = 'info'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const rae = new RAE()
		const m = await l.send('info.rae.loading', args[0])
		const search = await rae.searchWord(args[0])
		if(search.getRes().length === 0){
			l.send('info.rae.no_results',args[0])
			return
		}
		const id = search.getRes()[0].getId()

		const word = await rae.fetchWord(id)
		const definitions = word.getDefinitions()

		m.edit(`*${definitions[0].getType()}* ${definitions[0].getDefinition()}`)
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
	
}