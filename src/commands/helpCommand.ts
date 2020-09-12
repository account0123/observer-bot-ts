import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import CommandHandler from "../commandHandler";
import { Lang } from "./lang/Lang";

export class HelpCommand implements ArgCommand {
	permission: string = ''
	shortdescription: string = 'info.help.description'
	fulldescription: string = 'info.help.fulldescription'
	commandNames: string[] = ['help', 'h']
	requiredArgs: number = 0
	examples: string[] = ['', 'createrole']
	usage: string = '[comando]'
	guildExclusive: boolean = false
	lang: Lang | undefined
	async run(msg: Message,l: Lang, args: string[]): Promise<void> {
		var embed
		const bot = msg.client.user!
		this.lang = l
		if (args.length > 0) {
			embed =	this.createHelpEmbed(args[0])
		}else{
			embed = this.createCommandList()
		}
		await embed.then(e=>{if(!e)return;msg.channel.send(e.setAuthor(bot.tag,bot.avatarURL({dynamic:true})!)).then(()=>console.log('Embed de ayuda enviado'))})
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
	private async createCommandList():Promise<MessageEmbed> {
		if(!this.lang) return new MessageEmbed()
		const l = this.lang
		const array = CommandHandler.commands.map(c=>`**${c.commandNames[0]}** - ${await l.translate(c.shortdescription)}`).concat(CommandHandler.argCommands.map(c=>`**${c.commandNames[0]}** - ${await l.translate(c.shortdescription)}`)).sort()
		return new MessageEmbed().setTitle(await l.translate('info.help.general.title')).setDescription(array).setFooter(await l.translate('info.help.general.footer',CommandHandler.prefix)).setTimestamp()
	}
	private async createHelpEmbed(commandName:string):Promise<MessageEmbed | undefined> {
		if(!this.lang) return new MessageEmbed()
		const l = this.lang
		const command = CommandHandler.commands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const argCommand = CommandHandler.argCommands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const about = 'info.help.about.'
		if (command) {
			return new MessageEmbed().setTitle(await l.translate(about + 'title',command.commandNames.shift()!))
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
			const embed = new MessageEmbed().setTitle(await l.translate(about + 'title',name)).setDescription(await l.translate(argCommand.fulldescription,Permissions.DEFAULT.toString()))
			if(argCommand.commandNames.length > 0) embed.addField(await l.translate(about + 'aliases'),argCommand.commandNames.join(', '),true)
			embed.addField(await l.translate(about + 'usage'),`${CommandHandler.prefix}${name} \`${await l.translate(argCommand.usage)}\``,true)
			.addField(await l.translate(about + 'required'),await buildField(),true)
			.addField(await l.translate(about + 'examples'),argCommand.examples.map(e=>`${CommandHandler.prefix}${name} ${e}`))
			.setFooter(await l.translate(about + 'footer'))
			.setTimestamp();
			return embed
		}
		return undefined
	}
}
