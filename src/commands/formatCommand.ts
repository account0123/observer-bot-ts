import { BaseGuildTextChannel, DMChannel, Message, Snowflake, Webhook } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { UserFinder } from "../util/UserFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class FormatCommand implements ArgCommand {
	type: string | undefined;
	requiredArgs = 1
	commandNames: string[] = ['format','f']
	guildExclusive = false
	shortdescription = 'info.format.description'
	fulldescription: string = this.shortdescription
	usage = 'info.format.usage'
	examples: string[] = ['Hi everyone\\nThis is another line','\\t<- there\'s a big space here.']
	permission = ''
	static webhooks: Map<Snowflake,Webhook>
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const c = args.join(' ')
		let f = c.replace('\\n','\n').replace('\\t','\t').replace('\\r','\r').replace('\\b','\b').replace('\\v','\v').replace('\\0','\0').replace('\\f','\f')
		if(!msg.client.user || !msg.guild) return
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!bot) return
		const user = msg.author
		if(!FormatCommand.webhooks) FormatCommand.webhooks = new Map()
		if (msg.channel instanceof DMChannel) {
			await msg.channel.send(f)
		} else {
			const c = <BaseGuildTextChannel>msg.channel
			let webhook = FormatCommand.webhooks.get(msg.channel.id)
			if(!webhook){
				if(bot.permissionsIn(<Extract<BaseGuildTextChannel, {rateLimitPerUser: number}>>c).has('ManageWebhooks')){
					webhook = await c.createWebhook({
						name: 'Clone',
						avatar: 'https://i.imgur.com/n1MdeHO.png',
					});
					FormatCommand.webhooks.set(msg.channel.id,webhook)
				}else{
					const matches = f.match(/@\S+/)
					if(matches){
						let i = 0
						for (const match of matches) {
							const user = UserFinder.getUser(msg,match)
							if(!user){
								i++
								continue
							}
							f = f.replace(match[i],user.username)
							i++
						}
					}
					await msg.channel.send({content: f, allowedMentions: {parse: ['users']}})

					return
				}
			}
			if(!webhook){
				msg.react('❌').catch()
				return
			}
			await webhook.send({
				content: f,
				username: user.username,
				avatarURL: user.displayAvatarURL(),
				allowedMentions: {parse: ['users']}
			}).then(msg.delete);
		}	
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
}