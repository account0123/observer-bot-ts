import { Message, Permissions} from "discord.js";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";
import {RAE}  from "rae-api"
import { PermissionsChecker } from "../util/PermissionsChecker";
export class DefineCommand implements ArgCommand {
	requiredArgs = 1
	commandNames: string[] = ['define', 'definir', 'buscar']
	guildExclusive = false
	shortdescription = 'info.rae.description'
	fulldescription: string = this.shortdescription
	usage = 'info.rae.usage'
	examples: string[] = ['hola', 'meme']
	permission = ''
	type = 'info'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const rae = new RAE()
		const m = await l.send('info.rae.loading', args[0])
		const search = await rae.searchWord(args[0])
		if(search.getRes().length === 0){
			m.edit(await l.translate('info.rae.no_results',args[0]))
			return
		}
		
		const results = search.getRes()
		const r = 0

		const res = results[r]
		const id = res.getId()

		const word = await rae.fetchWord(id)
		const definitions = word.getDefinitions()
	
		let t: string
		if(l.language == 'en'){
			const p = res.getHeader()
			const pC = p.replace(p.charAt(0), p.charAt(0).toUpperCase())
			t = await l.translate('info.rae.title', pC)
		}else t = await l.translate('info.rae.title', res.getHeader())

		await m.edit(`**${t}**\n**1.** *${definitions[0].getType()}* ${definitions[0].getDefinition()}`)
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(msg.channel.type == 'DM') return true
		return PermissionsChecker.check(new Permissions(['SEND_MESSAGES', 'ADD_REACTIONS', 'MANAGE_MESSAGES']), msg, l)
	}
	
}