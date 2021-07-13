import { DMChannel, GuildChannel, Message, NewsChannel, TextChannel, MessageEmbed } from "discord.js";
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
	type = 'info'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		if(!GetPassCommand.validatePassword(msg.author.id, msg.guild!.id, l, args[0])) return
		let channel
		if(args.length === 1) channel = msg.channel
		else channel = ChannelFinder.getChannel(msg, args[1])
		if(!channel){
			l.reply('errors.invalid_channel', args[1])
			return
		}
		if(channel instanceof DMChannel || !channel.isText()) return
		const wh = await channel.fetchWebhooks()
		const start = await l.send('info.webhooks.start', channel.toString())
        const e = new MessageEmbed().setTitle('Webhooks')
		for (const w of wh.values()) {
            e.addField(w.name, `\`${w.url}\``)
		}
        start.edit(e)
	}

	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		return true
	}
	
}