import ArgCommand from "./commandArgInterface";
import { BaseInteraction, ButtonComponent, ButtonInteraction, ChatInputCommandInteraction, Client, EmbedBuilder, Guild, Message, MessageComponentInteraction, PermissionsBitField, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import CommandHandler from "../commandHandler";
import { InteractionLang, Lang } from "./lang/Lang";
import Command from "./commandInterface";
import { PermissionsChecker } from "../util/PermissionsChecker";
import SlashCommand from "./slashCommandInterface";
import { SlashCommandBuilder } from '@discordjs/builders';

type BotCommand = {
	name: string
	summary: string
}
export class HelpCommand implements SlashCommand {
	type: string | undefined;
	permission = ''
	shortdescription = 'info.help.description'
	fulldescription = 'info.help.fulldescription'
	commandNames: string[] = ['help', 'h']
	requiredArgs = 0
	examples: string[] = ['', 'createrole']
	usage = 'info.help.usage'
	guildExclusive = false
	lang: Lang | InteractionLang | undefined
	prefix: string | undefined
	guild: Guild | undefined
	async run(msg: Message,l: Lang, args: string[], prefix: string): Promise<void> {
		this.lang = l
		this.prefix = prefix
		this.guild = msg.guild || undefined
		if (args.length > 0) this.createHelpEmbed(args[0], msg)
		else{
			this.createCommandList(msg)
		}
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
	private async buildCommandList(page: number, msg: Message | BaseInteraction| MessageComponentInteraction): Promise<EmbedBuilder>{
		// verification
		const f = new EmbedBuilder().setDescription('Embed not available')
		if(!this.lang || !this.prefix)
			return f
		// declarations
		const managers: BotCommand[] = [], informers: BotCommand[] = [], random: BotCommand[] = [],  
		moderators: BotCommand[] = [], configurators: BotCommand[] = []
		const embed = new EmbedBuilder(), l = this.lang, bot = msg.client.user
		const t = 'categories.', [manage, info, misc, mod, config] = await Promise.all([l.translate(t+'manage'), l.translate(t+'info'),l.translate(t+'misc'), l.translate(t+'mod'), l.translate(t+'config')])
		if(!bot) return f

		// builds a generic embed
		if(msg.guild){
			const m = msg.guild.members.resolve(bot)
			if(m) embed.setColor(m.displayColor)
		}
		else embed.setColor(0xffffff)
		const a = bot.avatarURL()
		if(!a) return f
		embed.setAuthor({name: bot.tag, url: a})
		const title = await l.translate('info.help.general.title')
		embed.setTitle(title)


		// separates commands by their type
		const divideList = async (c:Command | ArgCommand) => {
			const o = {name: c.commandNames[0], summary: c.shortdescription}
			if(!c.type){
				random.push(o)
				return
			}
			switch(c.type){
				case 'info': informers.push(o); break;
				case 'manage': managers.push(o); break;
				case 'mod': moderators.push(o); break;
				case 'config': configurators.push(o)
			}
		};
		CommandHandler.argCommands.forEach(c=>divideList(c))
		CommandHandler.commands.forEach(c=>divideList(c))

		// creates embed.description (all commands list)
		const createList = async (commands: BotCommand[]) =>{
			const a: string[] = []
			for await (const c of commands) {
				const description = await l.translate(c.summary);
				a.push(`\`${c.name}\` - ${description}`)
			}
			return a.join('\n')
		}

		// builds each page and returns
		if(page == 1){
			embed.addFields([{name: mod, value: await createList(moderators)}])
			const footer = await l.translate('info.help.general.footer', '1', '3', this.prefix)
			embed.setFooter({text: footer}).setTimestamp();
			return embed
		}
		if(page == 2){
			embed.addFields([
				{name: manage, value: await createList(managers)},
				{name: info, value: await createList(informers)}
			]);
			const footer = await l.translate('info.help.general.footer', '2', '3', this.prefix)
			embed.setFooter({text: footer}).setTimestamp();
			return embed
		}
		if(page == 3){
			embed.addFields([
				{name: config, value: await createList(configurators)},
				{name: misc, value: await createList(random)}
			]);
			const footer = await l.translate('info.help.general.footer', '3', '3', this.prefix)
			embed.setFooter({text: footer}).setTimestamp();
			return embed
		}
		return f
	}
	private async createCommandList(msg: Message) {
		const embed = await this.buildCommandList(1, msg)
		// Creating components list
		const prev_button = {type: 2,style: 1, customId: 'help_previous', label: '<', disabled: true}
		const next_button = {type: 2,style: 1, label: '>', customId: 'help_next'}
		const row = {type: 1, components: [prev_button, next_button]}
		// Sending embed page + reactions
		msg.channel.send({embeds: [embed], components: [row]}).then(()=>{
			console.log('Embed de ayuda enviado')
		})
	}

	private async buildHelpEmbed(commandName: string, guild: Guild | null, client: Client): Promise<EmbedBuilder>{
		// verification
		const f = new EmbedBuilder().setDescription('Embed not available')
		if(!this.lang || !this.prefix)
			return f
		const l = this.lang
		const embed = new EmbedBuilder()
		const command = CommandHandler.commands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const argCommand = CommandHandler.argCommands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const about = 'info.help.about.'
		if (command) {
			embed.setTitle(await l.translate(about + 'title',command.commandNames.shift() || ''))
			.setDescription(await l.translate(command.fulldescription))
			.addFields([
				{name: await l.translate(about + 'aliases'), value: command.commandNames.join(', '), inline: true},
				{name: await l.translate(about + 'usage'), value: await l.translate('info.help.default.no_usage'), inline: true}])
			.setTimestamp();
		}
		if (argCommand) {
			const droute = 'info.help.default.'
			const buildField = async () => {
				switch (argCommand.permission) {
					case '':
						return await l.translate(droute + 'no_permissions')
					case 'Administrador':
						return await l.translate(droute + 'admin_exclusive')
					default:
						return await l.translate(droute + 'permission_or_admin',await l.translate('permissions.' + argCommand.permission))
				}
			}
			const name = argCommand.commandNames.shift() || ''
			embed.setTitle(await l.translate(about + 'title',name)).setDescription(await l.translate(argCommand.fulldescription,PermissionsBitField.Default.toString(16)))
			if(argCommand.commandNames.length > 0)
				embed.addFields([{name: await l.translate(about + 'aliases'), value: argCommand.commandNames.join(', '), inline: true}])
			embed.addFields([
				{name: await l.translate(about + 'usage'), value: `${this.prefix}${name} \`${await l.translate(argCommand.usage)}\``, inline: true},
				{name: await l.translate(about + 'examples'), value: argCommand.examples.map(e=>`${this.prefix}${name} ${e}`).join('\n')},
				{name: await l.translate(about + 'required'), value:await buildField() }])
			.setFooter({text: await l.translate(about + 'footer')})
			.setTimestamp();
		}
		const bot = client.user
		if(!bot) return f
		let m
		if(guild) m = guild.members.resolve(bot)
		if(m) embed.setColor(m.displayColor)
		else embed.setColor(0xffffff)
		const a = bot.avatarURL()
		if(!a) return f
		return embed.setAuthor({name: bot.tag, url: a})
	}

	private async createHelpEmbed(commandName:string, msg: Message) {
		if(!this.lang) return
		const embed = await this.buildHelpEmbed(commandName, msg.guild, msg.client)
		if(embed.data.title == null){
            msg.react('❌').catch(e=>console.error(e))
			if(this.lang instanceof Lang)
				this.lang.reply('info.help.not_found', commandName)
            return
        }
		
		msg.channel.send({embeds: [embed]})
		.then(()=>console.log('Embed de ayuda enviado')).catch(e=>{
			if(!msg || !(this.lang instanceof Lang)) return
			const p = PermissionsChecker.check(new PermissionsBitField('SendMessages'), msg, this.lang)
			p.then((c)=>{if(c) console.error(e)}).catch(err=>console.error(err))
		});
	}

	static get(): RESTPostAPIChatInputApplicationCommandsJSONBody{
		const s = new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows command list or information about a command')
		.addStringOption(op=>op.setName('command').setDescription('The command to search about'))
		return s.toJSON()
	}
	async change_page(button: ButtonInteraction, l: InteractionLang, prefix: string): Promise<void>{
		this.prefix = prefix
		this.lang = l
		let prev_button, next_button
		const pages = 3
		// 1 & 2
		if(button.customId == 'help_next'){
			const footer = button.message.embeds[0].footer
			if(!footer) return
			const matches = footer.text.match(/[1-3]+/)
			if(!matches) return
			const next_page = parseInt(matches[0]) + 1

			const c = button.message.components
			if(!c) return
			const comps = <ButtonComponent[]>c[0].components
			const next = comps.find(a=>a.label=='>')
			const prev = comps.find(a=>a.label=='<')
			if(!prev) return
			if(!next) return
			prev_button = prev.toJSON()
			next_button = next.toJSON()
			if(next_page == pages) next_button.disabled = true
			if(next_page == 2) prev_button.disabled = false
			const row = {type: 1, components: [prev_button, next_button]}
			const embed = await this.buildCommandList(next_page, button)
			button.update({embeds: [embed], components: [row]})
			return
		}
		// 2 & 3
		if(button.customId == 'help_previous'){
			const footer = button.message.embeds[0].footer
			if(!footer) return
			const matches = footer.text.match(/[1-3]+/)
			if(!matches) return
			const previous_page = parseInt(matches[0]) - 1

			const c = button.message.components
			if(!c) return
			const comps = <ButtonComponent[]>c[0].components
			const next = comps.find(a=>a.label=='>')
			const prev = comps.find(a=>a.label=='<')
			if(!prev) return
			if(!next) return
			prev_button = prev.toJSON()
			next_button = next.toJSON()
			if(previous_page == 1) prev_button.disabled = true
			if(previous_page == pages - 1) next_button.disabled = false
			const row = {
				type: 1, components: [prev_button, next_button]
			}
			const embed = await this.buildCommandList(previous_page, button)
			button.update({embeds: [embed], components: [row]})
		}
	}
	verify(): Promise<boolean> {
		return Promise.resolve(true)
	}
	async interact(interaction: ChatInputCommandInteraction, l: InteractionLang, prefix: string): Promise<void> {
		this.lang = l
		this.prefix = prefix
		await interaction.deferReply({ephemeral: true})
		if(interaction.options.data.length == 0){
			const prev_button = {
				type: 2,
				style: 1,
				label: "<",
				customId: "help_previous",
				disabled: true
			};
			const next_button = {
				type: 2,
				style: 1,
				label: ">",
				customId: "help_next"
			};
			const row = {
				type: 1, components: [prev_button, next_button]
			}
			const embed = await this.buildCommandList(1, interaction)
			interaction.editReply({embeds: [embed], components: [row]})
			return
		}else{
			const commandName = interaction.options.getString('command', true)
			const embed = await this.buildHelpEmbed(commandName, interaction.guild, interaction.client)
			if(embed.data.title == null){
			if(this.lang instanceof InteractionLang)
				return this.lang.reply('info.help.not_found', commandName)
			}
			interaction.editReply({embeds: [embed]})
			return
		}
	}
}
