import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed } from "discord.js";
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
	lang:Lang = new Lang('')
	async run(msg: Message, args: string[]): Promise<void> {
		msg.channel.send('Comando no disponible por reparaciones')
		return
		this.lang = new Lang(msg.guild!.id)
		var embed
		const bot = msg.client.user!
		if (args.length > 0) {
			embed =	this.createHelpEmbed(args[0])
		}else{
			embed = this.createCommandList()
		}
		if (!embed) return
		await msg.channel.send(embed.setAuthor(bot.tag,bot.avatarURL({dynamic:true})!)).then(()=>console.log('Embed de ayuda enviado'))
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		return true
	}
	private createCommandList():MessageEmbed {
		const array = CommandHandler.commands.map(c=>`**${c.commandNames[0]}** - ${this.lang.translate(c.shortdescription)}`).concat(CommandHandler.argCommands.map(c=>`**${c.commandNames[0]}** - ${this.lang.translate(c.shortdescription)}`)).sort()
		return new MessageEmbed().setTitle(this.lang.translate('info.help.general.title')).setDescription(array).setFooter(this.lang.translate('info.help.general.footer',CommandHandler.prefix)).setTimestamp()
	}
	private createHelpEmbed(commandName:string):MessageEmbed | undefined {
		const command = CommandHandler.commands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const argCommand = CommandHandler.argCommands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const about = 'info.help.about.'
		if (command) {
			return new MessageEmbed().setTitle(this.lang.translate(about + 'title',command.commandNames.shift()!))
			.addField(this.lang.translate(about + 'aliases'),command.commandNames.join(', '),true)
			.addField(this.lang.translate(about + 'required'),this.lang.translate('info.help.default.no_usage'),true)
			.addField(this.lang.translate(about + 'required'),'',true)
			.setTimestamp();
		}
		if (argCommand) {
			const droute = 'info.help.default.'
			const buildField = () => {
				switch (argCommand.permission) {
					case '':
						return this.lang.translate(droute + 'no_permissions')
					case 'Administrador':
						return this.lang.translate(droute + 'admin_exclusive')
					default:
						return this.lang.translate(droute + 'permission_or_admin',argCommand.permission)
				}
			}
			const name = argCommand.commandNames.shift()!
			const embed = new MessageEmbed().setTitle(this.lang.translate(about + 'title',name)).setDescription(argCommand.fulldescription)
			if(argCommand.commandNames.length > 0) embed.addField(this.lang.translate(about + 'alias'),argCommand.commandNames.join(', '),true)
			embed.addField(this.lang.translate(about + 'usage'),`${CommandHandler.prefix}${name} \`${argCommand.usage}\``,true)
			.addField(this.lang.translate(about + 'required'),buildField(),true)
			.addField(this.lang.translate(about + 'examples'),argCommand.examples.map(e=>`${CommandHandler.prefix}${name} \`${e}\``))
			.setFooter(this.lang.translate(about + 'footer'))
			.setTimestamp();
			return embed
		}
		return undefined
	}
}
