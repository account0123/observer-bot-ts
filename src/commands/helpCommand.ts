import ArgCommand from "./commandArgInterface";
import { CollectorFilter, Message, MessageEmbed, MessageReaction, Permissions, ReactionCollector, User } from "discord.js";
import CommandHandler from "../commandHandler";
import { Lang } from "./lang/Lang";
import Command from "./commandInterface";

export class HelpCommand implements ArgCommand {
	permission: string = ''
	shortdescription: string = 'info.help.description'
	fulldescription: string = 'info.help.fulldescription'
	commandNames: string[] = ['help', 'h']
	requiredArgs: number = 0
	examples: string[] = ['', 'createrole']
	usage: string = 'info.help.usage'
	guildExclusive: boolean = false
	lang: Lang | undefined
	prefix: string | undefined
	msg: Message | undefined
	async run(msg: Message,l: Lang, args: string[], prefix: string): Promise<void> {
		this.lang = l
		this.prefix = prefix
		this.msg = msg
		if (args.length > 0) this.createHelpEmbed(args[0])
		else this.createCommandList()
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
	private async createCommandList() {
		if(!this.lang || !this.prefix || !this.msg) return
		const l = this.lang
		// creates embed.description (all commands list)
		const createList = async (c:Command | ArgCommand) => `**${c.commandNames[0]}** - ${await l.translate(c.shortdescription)}`;
		const array = CommandHandler.commands.map(async c=>await createList(c)).concat(CommandHandler.argCommands.map(async c=>await createList(c)))
		const allcommands = (await Promise.all(array)).sort()
		const pages:string[][] = []
		let limit = 2048
		let characters = 0
		let commands: string[] = []
		// loop for each command (string) of allcommands (string[])
		for(const command of allcommands) {
			// adds length of command
			characters += command.length + 1
			// while characters + command.length < or = 2048, commands <- command
			if(characters <= limit) commands.push(command)
			else {
				// if characters + command.length > 2048, pages <- commands, commands will be empty, limit increases
				pages.push(commands)
				commands = []
				commands.push(command)
				limit += limit
			}
		}
		if(commands.length > 0) pages.push(commands)
		// Building an embed page
		const title = await l.translate('info.help.general.title')
		const footer = await l.translate('info.help.general.footer',this.prefix)
		const embed = new MessageEmbed().setTitle(title).setDescription(pages[0]).setFooter(footer).setTimestamp();
		const bot = this.msg.client.user!
		if(this.msg.guild) embed.setColor(this.msg.guild.member(bot)!.displayColor)
		else embed.setColor(0xffffff)
		embed.setAuthor(bot.tag,bot.avatarURL({dynamic:true})!)
		// Creating message components
		/** 
		const prev_button = {
			type: 2,
			style: 2,
			label: "<",
			custom_id: "previous",
			disabled: true
		};
		const next_button = {
			type: 2,
			style: 1,
			label: ">",
			custom_id: "next"
		};
		const row = {
			type: 1,
			components: [prev_button, next_button]
		}
		*/
		// Sending embed page + reactions
		this.msg.channel.send(embed).then((msg)=>{
			let page = 1
			if(pages.length < 2) return
			msg.react('➡️')
			const f: CollectorFilter = (reaction: MessageReaction, user: User) => {
				if((reaction.emoji.name === '➡️' || reaction.emoji.name === '⬅️') && user.id != bot.id) return true
				else return false
			};
			const rc = new ReactionCollector(msg, f, {time: 60000})
			rc.on('collect', (reaction, user)=>{
				if(!f(reaction, user)) return
				if(reaction.emoji.name === '➡️'){
					page++
					msg.react('⬅️')
					reaction.remove()
					if(pages.length < page){
						page--
						return
					}
					const e2 = new MessageEmbed().setAuthor(bot.tag,bot.avatarURL({dynamic:true})!).setTitle(title).setDescription(pages[page -1]).setFooter(`Page ${page} of ${pages.length} |` + footer).setTimestamp()
					if(msg.guild) e2.setColor(msg.guild.member(bot)!.displayColor)
					else e2.setColor(0xffffff)
					msg.edit(e2);
				}
				if(reaction.emoji.name === '⬅️'){
					msg.react('➡️')
					page--
					if(page === 0){
						page = 1
						return
					}
					const e2 = new MessageEmbed().setAuthor(bot.tag,bot.avatarURL({dynamic:true})!).setTitle(title).setDescription(pages[page - 1]).setFooter(`Page ${page} of ${pages.length} |` + footer).setTimestamp()
					if(msg.guild) e2.setColor(msg.guild.member(bot)!.displayColor)
					else e2.setColor(0xffffff)
					msg.edit(e2);
				}
			});
			console.log('Embed de ayuda enviado')})
	}
	private async createHelpEmbed(commandName:string) {
		if(!this.lang || !this.msg) return
		const l = this.lang
		const command = CommandHandler.commands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const argCommand = CommandHandler.argCommands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const about = 'info.help.about.'
		let embed
		if (command) {
			embed = new MessageEmbed().setTitle(await l.translate(about + 'title',command.commandNames.shift()!))
			.setDescription(await l.translate(command.fulldescription))
			.addField(await l.translate(about + 'aliases'),command.commandNames.join(', '),true)
			.addField(await l.translate(about + 'usage'),await l.translate('info.help.default.no_usage'),true)
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
			const name = argCommand.commandNames.shift()!
			embed = new MessageEmbed().setTitle(await l.translate(about + 'title',name)).setDescription(await l.translate(argCommand.fulldescription,Permissions.DEFAULT.toString(16)))
			if(argCommand.commandNames.length > 0) embed.addField(await l.translate(about + 'aliases'),argCommand.commandNames.join(', '),true)
			embed.addField(await l.translate(about + 'usage'),`${this.prefix}${name} \`${await l.translate(argCommand.usage)}\``,true)
			.addField(await l.translate(about + 'required'),await buildField(),true)
			.addField(await l.translate(about + 'examples'),argCommand.examples.map(e=>`${this.prefix}${name} ${e}\n`))
			.setFooter(await l.translate(about + 'footer'))
			.setTimestamp();
		}
		if(!embed){
            this.msg.react('❌')
            l.send('info.help.not_found', commandName)
            return
        }
		const bot = this.msg.client.user!
		if(this.msg.guild) embed.setColor(this.msg.guild!.member(bot)!.displayColor)
		else embed.setColor(0xffffff)
		this.msg.channel.send(embed.setAuthor(bot.tag,bot.avatarURL({dynamic:true})!)).then(()=>console.log('Embed de ayuda enviado'));
	}
}
