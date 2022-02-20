import { ButtonInteraction, CacheType, CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import { InteractionLang, Lang } from "./lang/Lang";
import {Definition, RAE}  from "rae-api"
import { APIButtonComponent, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types";
import { SlashCommandBuilder } from '@discordjs/builders';
import SlashCommand from "./slashCommandInterface";

export class DefineCommand implements SlashCommand {
	requiredArgs = 1
	commandNames: string[] = ['define', 'definir', 'buscar']
	guildExclusive = false
	shortdescription = 'info.rae.description'
	fulldescription: string = this.shortdescription
	usage = 'info.rae.usage'
	examples: string[] = ['hola', 'meme']
	permission = ''
	type = 'info'
	rae = new RAE()
	cache: Map<string, Definition[]> = new Map()
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const search = await this.rae.searchWord(args[0])
		if(search.getRes().length === 0){
			l.reply('info.rae.no_results',args[0])
			return
		}
		
		const results = search.getRes()
		const r = 0

		const res = results[r]
		const id = res.getId()
		const footer = `ID: ${id}`
		const word = await this.rae.fetchWord(id)
		const definitions = word.getDefinitions()
		this.cache.set(id, definitions)
		let t: string
		if(l.language == 'en'){
			const p = res.getHeader()
			const pC = p.replace(p.charAt(0), p.charAt(0).toUpperCase())
			t = await l.translate('info.rae.title', pC)
		}else t = await l.translate('info.rae.title', res.getHeader())

		const prev_button = {
			type: 2,
			style: 1,
			label: "<",
			customId: "previous_def",
			disabled: true
		};
		const next_button = {
			type: 2,
			style: 1,
			label: ">",
			customId: "next_def"
		};
		const row = {
			type: 1, components: [prev_button, next_button]
		}
		const embed = new MessageEmbed().setTitle(t)
		.setDescription(`**1.** *${definitions[0].getType()}* ${definitions[0].getDefinition()}`)
		.setFooter({text: footer})
		
		if(definitions.length == 1)
			msg.channel.send({embeds: [embed]})
		else
			msg.channel.send({embeds: [embed],components: [row]})
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
	static get(): RESTPostAPIApplicationCommandsJSONBody{
		const s = new SlashCommandBuilder()
		.setName('define')
		.setDescription('Define una palabra buscando en la RAE')
		.addStringOption(op=>op.setName('palabra').setDescription('La palabra a buscar').setRequired(true))
		return s.toJSON()
	}

	async change_page(button: ButtonInteraction<CacheType>): Promise<void> {
		// 1, 2...
		if(button.customId == 'next_def'){
			const embed = button.message.embeds[0]
			const description = embed.description
			if(!description) return
			const page_matches = description.match(/[\d]+/)
			if(!page_matches) return
			const next_page = parseInt(page_matches[0]) + 1
			
			const footer = embed.footer
			if(!footer) return
			const matches = footer.text.match(/ID: (\w+)/)
			if(!matches) return
			const id = matches[1]

			let definitions = this.cache.get(id)
			if(!definitions){
				const word = await this.rae.fetchWord(id)
				definitions = word.getDefinitions()
			}
			const pages = definitions.length

			const c = button.message.components
			if(!c) return
			const comps = <APIButtonComponent[]>c[0].components
			const next = comps.find(a=>a.label=='>')
			const prev = comps.find(a=>a.label=='<')
			if(!prev) return
			if(!next) return

			if(next_page == pages) next.disabled = true
			if(next_page == 2) prev.disabled = false
			const prev_button = new MessageButton(prev)
			const next_button = new MessageButton(next)
			const row = new MessageActionRow({components: [prev_button, next_button]})
			const new_description = `**${next_page}** *${definitions[next_page - 1].getType()}* ${definitions[next_page - 1].getDefinition()}`
			embed.description = new_description
			return button.update({embeds: [embed], components: [row]})
		}
		if(button.customId == 'previous_def'){
			const embed = button.message.embeds[0]
			const description = embed.description
			if(!description) return
			const page_matches = description.match(/[\d]+/)
			if(!page_matches) return
			const prev_page = parseInt(page_matches[0]) - 1

			const footer = embed.footer
			if(!footer) return
			const matches = footer.text.match(/ID: (\w+)/)
			if(!matches) return
			const id = matches[1]

			let definitions = this.cache.get(id)
			if(!definitions){
				const word = await this.rae.fetchWord(id)
				definitions = word.getDefinitions()
			}
			const pages = definitions.length

			const c = button.message.components
			if(!c) return
			const comps = <APIButtonComponent[]>c[0].components
			const next = comps.find(a=>a.label=='>')
			const prev = comps.find(a=>a.label=='<')
			if(!prev) return
			if(!next) return

			if(prev_page == 1) prev.disabled = true
			if(prev_page == pages - 1) next.disabled = false
			const prev_button = new MessageButton(prev)
			const next_button = new MessageButton(next)
			const row = new MessageActionRow({components: [prev_button, next_button]})
			const new_description = `**${prev_page}** *${definitions[prev_page - 1].getType()}* ${definitions[prev_page - 1].getDefinition()}`
			embed.description = new_description
			return button.update({embeds: [embed], components: [row]})
		}
	}

	verify(): Promise<boolean> {
		return Promise.resolve(true)
	}
	async interact(interaction: CommandInteraction<CacheType>, l: InteractionLang): Promise<void> {
		const input = interaction.options.getString('palabra', true)
		const search = await this.rae.searchWord(input)
		if(search.getRes().length === 0)
			return interaction.reply(await l.translate('info.rae.no_results', input))
		const results = search.getRes()
	
		const res = results[0]
		const id = res.getId()
		const footer = `ID: ${id}`

		const word = await this.rae.fetchWord(id)
		const definitions = word.getDefinitions()
		this.cache.set(id, definitions)
		let t: string
		if(l.language == 'en'){
			const p = res.getHeader()
			const pC = p.replace(p.charAt(0), p.charAt(0).toUpperCase())
			t = await l.translate('info.rae.title', pC)
		}else t = await l.translate('info.rae.title', res.getHeader())

		const prev_button = {
			type: 2,
			style: 1,
			label: "<",
			customId: "previous_def",
			disabled: true
		};
		const next_button = {
			type: 2,
			style: 1,
			label: ">",
			customId: "next_def"
		};
		const row = {
			type: 1, components: [prev_button, next_button]
		}
		const embed = new MessageEmbed().setTitle(t)
			.setDescription(`**1.** *${definitions[0].getType()}* ${definitions[0].getDefinition()}`)
			.setFooter({text: footer})
		if(definitions.length == 1)
			return interaction.reply({embeds: [embed]})
		else
			return interaction.reply({embeds: [embed],components: [row]})
	}
}