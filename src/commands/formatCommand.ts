import { DMChannel, Message, Permissions, TextChannel, Webhook } from "discord.js";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class FormatCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['format','f']
	guildExclusive: boolean = false
	shortdescription: string = 'info.format.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.format.usage'
	examples: string[] = ['Hi everyone\\nThis is another line','\\t<- there\'s a big space here.']
	permission: string = ''
	static webhook: Webhook | null = null
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const c = args.join(' ')
		const f = c.replace('\\n','\n').replace('\\t','\t').replace('\\r','\r').replace('\\b','\b').replace('\\v','\v').replace('\\0','\0').replace('\\f','\f')
		const bot = msg.guild!.member(msg.client.user!)!
		const user = msg.author
		if (msg.channel instanceof DMChannel) {
			await msg.channel.send(f,{disableMentions: 'everyone'})
		} else {
			if(FormatCommand.webhook === null && bot.hasPermission(Permissions.FLAGS.MANAGE_WEBHOOKS)){
				FormatCommand.webhook = await msg.channel.createWebhook('Clone', {
					avatar: 'https://i.imgur.com/n1MdeHO.png',
				});
				FormatCommand.webhook.send(f,{
					username: user.username,
					avatarURL: user.displayAvatarURL({dynamic:true}),
					disableMentions: 'all'
				}).then(()=>msg.delete());
			}
		}
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
}