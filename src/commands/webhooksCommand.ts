import { DMChannel, GuildChannel, Message, NewsChannel, TextChannel } from "discord.js";
import { ChannelFinder } from "../util/ChannelFinder";
import ArgCommand from "./commandArgInterface";
import { GetPassCommand } from "./getPassCommand";
import { Lang } from "./lang/Lang";

export class WebhooksCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['webhooks','wh', 'infowh']
	guildExclusive: boolean = true
	shortdescription: string = 'info.webhooks.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.webhooks.usage'
	examples: string[] = ['1234567890abcdef', '1234567890abcdef general']
	permission: string = ''
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const allowed = GetPassCommand.validatePassword(msg.author.id, l, args[0])
		if(!allowed) return
		let channel
		if(args.length === 1) channel = msg.channel
		else channel = ChannelFinder.getChannel(msg, args[1])
		if(!channel){
			l.reply('errors.invalid_channel', args[1])
			return
		}
		if(channel instanceof DMChannel || !channel.isText()) return
		const wh = await channel.fetchWebhooks()
		const start = await l.translate('info.webhooks.start', channel.toString())
		msg.channel.send(start)
		for (const w of wh.values()) {
			msg.channel.send(`\`\`\`\n ${w.url}\n\`\`\``)
		}
	}

	async checkPermissions(msg: Message, l: Lang, prefix?: string): Promise<boolean> {
		return true
	}
	
}