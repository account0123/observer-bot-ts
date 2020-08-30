import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed } from "discord.js";
import CommandHandler from "../commandHandler";

export class HelpCommand implements ArgCommand {
	permission: string = ''
	shortdescription: string = 'Comando de ayuda.'
	fulldescription: string = 'Muestra una lista de todos los comando al no haber argumentos, o la ayuda detallada del comando indicado.'
	commandNames: string[] = ['help', 'h']
	requiredArgs: number = 0
	examples: string[] = ['', 'createrole']
	usage: string = '[comando]'
	guildExclusive: boolean = false
	async run(msg: Message, args: string[]): Promise<void> {
		var embed
		const bot = msg.client.user!
		if (args.length > 0) {
			embed =	createHelpEmbed(args[0])
		}else{
			embed = createCommandList()
		}
		if (!embed) return
		await msg.channel.send(embed.setAuthor(bot.tag,bot.avatarURL({dynamic:true})!)).then(()=>console.log('Embed de ayuda enviado'))
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		return true
	}
	
}
function createCommandList():MessageEmbed {
	const array = CommandHandler.commands.map(c=>`**${c.commandNames[0]}** - ${c.shortdescription}`).concat(CommandHandler.argCommands.map(c=>`**${c.commandNames[0]}** - ${c.shortdescription}`)).sort()
	return new MessageEmbed().setTitle('Todos los comandos de Observador').setDescription(array).setFooter(`Usa ${CommandHandler.prefix}help <comando> para ver cómo usar el comando`).setTimestamp()
}
function createHelpEmbed(commandName:string):MessageEmbed | undefined {
	const command = CommandHandler.commands.find(command => command.commandNames.includes(commandName.toLowerCase()))
	const argCommand = CommandHandler.argCommands.find(command => command.commandNames.includes(commandName.toLowerCase()))
	if (command) {
		return new MessageEmbed().setTitle(`Comando ${command.commandNames.shift()}`)
		.addField('Alias',command.commandNames.join(', '),true)
		.addField('Uso','*Solo pones el comando y ya*',true)
		.addField('Permisos necesarios','*No se necesitan permisos*',true)
		.setTimestamp();
	}
	if (argCommand) {
		const buildField = () => {
			switch (argCommand.permission) {
				case '':
					return '*No se necesitan permisos*'
				case 'Administrador':
					return 'Administrador'
				default:
					return argCommand.permission + ' o Administrador'
			}
		}
		const name = argCommand.commandNames.shift()
		const embed = new MessageEmbed().setTitle(`Comando ${name}`).setDescription(argCommand.fulldescription)
		if(argCommand.commandNames.length > 0) embed.addField('Alias',argCommand.commandNames.join(', '),true)
		embed.addField('Uso',`${CommandHandler.prefix}${name} \`${argCommand.usage}\``,true)
		.addField('Permisos necesarios',buildField(),true)
		.addField('Ejemplos',argCommand.examples.map(e=>`${CommandHandler.prefix}${name} \`${e}\``))
		.setFooter('<> = obligatorio | [] = opcional. | No incluyas estos símbolos al momento de ejecutar el comando.')
		.setTimestamp();
		return embed
	}
	return undefined
}