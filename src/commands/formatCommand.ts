import { DMChannel, Message, Permissions, Snowflake, TextChannel, Webhook } from "discord.js";
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
	static webhooks: Map<Snowflake,Webhook>
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const c = args.join(' ')
		const f = c.replace('\\n','\n').replace('\\t','\t').replace('\\r','\r').replace('\\b','\b').replace('\\v','\v').replace('\\0','\0').replace('\\f','\f')
		const bot = msg.guild!.member(msg.client.user!)!
		const user = msg.author
		if (msg.channel instanceof DMChannel) {
			await msg.channel.send(f)
		} else {
			var webhook = FormatCommand.webhooks.get(msg.channel.id)
			if(!webhook){
				if(bot.hasPermission(Permissions.FLAGS.MANAGE_WEBHOOKS)){
					webhook = await msg.channel.createWebhook('Clone', {
						avatar: 'https://i.imgur.com/n1MdeHO.png',
					});
					FormatCommand.webhooks.set(msg.channel.id,webhook)
				}else await msg.channel.send(f,{allowedMentions: {parse: ['users']}})
				return
			}
			await webhook.send(f,{
				username: user.username,
				avatarURL: user.displayAvatarURL({dynamic:true}),
				allowedMentions: {parse: ['users']}
			}).then(()=>msg.delete());
		}	
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
}