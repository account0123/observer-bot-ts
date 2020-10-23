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
		if(!this.lang) return
		if(!this.prefix) return
		if(!this.msg) return
		const l = this.lang
		const createList = async (c:Command | ArgCommand) => `**${c.commandNames[0]}** - ${await l.translate(c.shortdescription)}`;
		const array = CommandHandler.commands.map(async c=>await createList(c)).concat(CommandHandler.argCommands.map(async c=>await createList(c)))
		const allcommands = (await Promise.all(array)).sort()
		const pages:string[][] = []
		let limit = 2048
		let characters = 0
		let commands: string[] = []
		for (const command of allcommands) {
			characters += command.length
			if(characters <= limit) commands.push(command)
			else {
				pages.push(commands)
				commands = []
				limit += limit
			}
		}
		const title = await l.translate('info.help.general.title')
		const footer = await l.translate('info.help.general.footer',this.prefix)
		const embed = new MessageEmbed().setTitle(title).setDescription(pages[0]).setFooter(footer).setTimestamp();
		const bot = this.msg.client.user!
		if(this.msg.guild) embed.setColor(this.msg.guild.member(bot)!.displayColor)
		else embed.setColor(0xffffff)
		embed.setAuthor(bot.tag,bot.avatarURL({dynamic:true})!)
		this.msg.channel.send(embed).then((msg)=>{
			msg.react('➡️')
			const f: CollectorFilter = (reaction: MessageReaction, user: User) => {
				if(reaction.emoji.name === '➡️' && user.id != bot.id) return true
				else return false
			};
			const rc = new ReactionCollector(msg, f, {time: 60000})
			rc.on('collect', (reaction)=>{
				reaction.remove()
				const e2 = new MessageEmbed().setAuthor(bot.tag,bot.avatarURL({dynamic:true})!).setTitle(title).setDescription(pages[1]).setFooter(footer).setTimestamp()
				if(msg.guild) e2.setColor(msg.guild.member(bot)!.displayColor)
				else e2.setColor(0xffffff)
				msg.edit(e2);
			});
			console.log('Embed de ayuda enviado')});
	}
	private async createHelpEmbed(commandName:string) {
		if(!this.lang) return
		if(!this.msg) return
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
		if(!embed) return
		const bot = this.msg.client.user!
		if(this.msg.guild) embed.setColor(this.msg.guild!.member(bot)!.displayColor)
		else embed.setColor(0xffffff)
		this.msg.channel.send(embed.setAuthor(bot.tag,bot.avatarURL({dynamic:true})!)).then(()=>console.log('Embed de ayuda enviado'));
	}
}
