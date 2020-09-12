import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { Lang } from "./lang/Lang";

export class CallCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['call', 'summon']
	guildExclusive: boolean = true
	shortdescription: string = 'info.call.description'
	fulldescription: string = 'info.call.fulldescription'
	usage: string = 'info.call.usage'
	examples: string[] = ['@user#1234 @user2#3221', '12335684247853234 987654321213456789 958372642132422']
	permission: string = 'MENTION_EVERYONE'
	async run(msg: Message, L: Lang, args: string[]): Promise<void> {
		const users = args.map(arg=>'<@'+arg+'>')
		const begin = await L.translate('info.call.start')
		const mention = users.join(', ')
		const end = '***'
		msg.channel.send(begin+mention+end)
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		if (!mod.hasPermission(Permissions.FLAGS.MENTION_EVERYONE)) {
			l.reply('errors.modperms.massmention')
			return false
		}
		return true
	}
}