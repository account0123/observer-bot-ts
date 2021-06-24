import { Message, MessageReaction, ReactionCollector, CollectorFilter, User} from "discord.js";
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
			m.edit(await l.translate('info.rae.no_results',args[0]))
			return
		}
		const res = search.getRes()[0]
		const id = res.getId()

		const word = await rae.fetchWord(id)
		const definitions = word.getDefinitions()
		let t: string
		if(await l.request(msg.guild!.id) == 'en'){
			const p = res.getHeader()
			const pC = p.replace(p.charAt(0), p.charAt(0).toUpperCase())
			t = await l.translate('info.rae.title', pC)
		}else t = await l.translate('info.rae.title', res.getHeader())

		await m.edit(`**${t}**\n**1.** *${definitions[0].getType()}* ${definitions[0].getDefinition()}`)
        const pages = definitions.length
		let page = 1
		await m.react('➡️')
		const f: CollectorFilter = (reaction: MessageReaction, user: User) => {
			if((reaction.emoji.name == '➡️' || reaction.emoji.name == '⬅️') && user.id == msg.author.id) return true
			else return false
		};
            const rc = new ReactionCollector(m, f, {idle: 30000})
            rc.on('collect', async (reaction, user)=>{
				if(!f(reaction, user)) return
				if(reaction.emoji.name == '➡️'){
                    if(page == pages) return
					page++
					loadPage(page)
					await m.reactions.removeAll()
					await m.react('⬅️')
					if(page < pages) m.react('➡️')
				}

				if(reaction.emoji.name === '⬅️'){
                    if(page == 1) return
					page--
					loadPage(page)
					await m.reactions.removeAll()
					if(page > 1) await m.react('⬅️')
					m.react('➡️')
				}

				async function loadPage(p: number){
					const def = definitions[p - 1]
                    m.edit(`**${t}**\n**${p}.** *${def.getType()}* ${def.getDefinition()}`)
				}
			});
			rc.once('end', ()=>{
				m.reactions.removeAll()
			});
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
	
}