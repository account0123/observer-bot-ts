import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { Lang } from "./lang/Lang";

export class CallCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['call', 'summon']
	guildExclusive: boolean = true
	shortdescription: string = 'Menciona en masa usando IDs'
	fulldescription: string = 'Utiliza la herramienta de búsqueda de usuarios para mencionarlos en CADA PALABRA DE LOS ARGUMENTOS'
	usage: string = '<usuario> [usuario]...'
	examples: string[] = ['@usuario#1234 @usuario2#3221', '12335684247853234 987654321213456789 9583726421']
	permission: string = 'Mencionar @everyone @here y todos los roles'
	async run(msg: Message, args: string[]): Promise<void> {
		const users = args.map(arg=>'<@'+arg+'>')
		const begin = '***Invocando a '
		const mention = users.join(', ')
		const end = '***'
		msg.channel.send(begin+mention+end)
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		if (!mod.hasPermission(Permissions.FLAGS.MENTION_EVERYONE)) {
			l.reply('errors.modperms.massmention',msg)
			return false
		}
		return true
	}
}