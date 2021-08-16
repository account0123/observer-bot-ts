import { Message, MessageReaction, ReactionCollector, CollectorFilter, User, Permissions} from "discord.js";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";
import {RAE}  from "rae-api"
import { PermissionsChecker } from "../util/PermissionsChecker";
export class RAECommand implements ArgCommand {
	requiredArgs = 1
	commandNames: string[] = ['rae', 'definir', 'buscar']
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
		let r = 0
		const results = search.getRes()
		let res = results[r]
		let id = res.getId()

		let word = await rae.fetchWord(id)
		let definitions = word.getDefinitions()

		let t: string
		if(l.language == 'en'){
			const p = res.getHeader()
			const pC = p.replace(p.charAt(0), p.charAt(0).toUpperCase())
			t = await l.translate('info.rae.title', pC)
		}else t = await l.translate('info.rae.title', res.getHeader())

		await m.edit(`**${t}**\n**1.** *${definitions[0].getType()}* ${definitions[0].getDefinition()}`)
        const pages = definitions.length
		let page = 1
		if(results.length > 1) await m.react('⬇️')
		const d_react = await m.react('▶️')
		const f: CollectorFilter = (reaction: MessageReaction, user: User) => {
			const e = reaction.emoji.name
			if((e == '▶️' || e == '◀️' || e == '⬇️') && user.id == msg.author.id) return true
			else return false
		};
            const rc = new ReactionCollector(m, f, {idle: 30000})
            rc.on('collect', async (reaction, user)=>{
				if(!f(reaction, user)) return

				if(reaction.emoji.name == '⬇️'){
					reaction.remove()
					if(results.length < 2) return
					if(r == results.length) d_react.remove()
					r++
					page = 1
					fetchWord()
				}

				if(reaction.emoji.name == '▶️'){
                    if(page == pages) return
					loadPage(++page)
					if(page == 2){
						await m.reactions.removeAll()
						await m.react('◀️')
						if(page < pages) m.react('▶️')
					}else reaction.remove()
				}

				if(reaction.emoji.name === '◀️'){
                    if(page == 1) return
					loadPage(--page)
					if(page == pages - 1){
						await m.reactions.removeAll()
						if(page > 1) await m.react('◀️')
						m.react('▶️')
					}else reaction.remove()
				}

				async function fetchWord(){
					res = results[r]
					id = res.getId()
			
					word = await rae.fetchWord(id)
					definitions = word.getDefinitions()
					if(l.language == 'en'){
						const p = res.getHeader()
						const pC = p.replace(p.charAt(0), p.charAt(0).toUpperCase())
						t = await l.translate('info.rae.title', pC)
					}else t = await l.translate('info.rae.title', res.getHeader())
					loadPage(1)
				}

				async function loadPage(p: number){
					const d = definitions[p - 1]
                    m.edit(`**${t}**\n**${p}.** *${d.getType()}* ${d.getDefinition()}`)
				}

			});
			rc.once('end', ()=>{
				m.reactions.removeAll()
			});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(msg.channel.type == 'dm') return true
		return PermissionsChecker.check(new Permissions(['SEND_MESSAGES', 'ADD_REACTIONS', 'MANAGE_MESSAGES']), msg, l)
	}
	
}