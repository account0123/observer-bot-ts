import ArgCommand from "./commandArgInterface";
import { Message, TextChannel } from "discord.js";
import { Lang } from "./lang/Lang";
import { ChannelFinder } from "../util/ChannelFinder";

export class SayCommand implements ArgCommand {
	type: string | undefined;
	permission: string = ''
	shortdescription: string = 'info.say.description'
	fulldescription: string = this.shortdescription
	async checkPermissions(msg: Message): Promise<boolean> {
		return true
	}
	commandNames: string[] = ['say', 'tell', 'speak']
	requiredArgs: number = 1
	examples: string[] = ['Hello world!!!','Hay pelotudos y luego estás tú']
	usage: string = 'info.say.usage'
	guildExclusive: boolean = false
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const text = args.join(' ')
		const regex = /to ([\w]+)$/m
		const m = text.match(regex)
		if(m && msg.guild){
			const bot = msg.guild.member(msg.client.user!)!
			const channel = ChannelFinder.getChannel(msg, m[1])
			if(channel && channel.type === 'text' && channel.permissionsFor(bot)!.has('SEND_MESSAGES')){
				const textchannel = <TextChannel> channel
				await textchannel.send(text.replace(regex,''), {disableMentions: 'everyone'})
				return
			}
		}
		await msg.channel.send(text,{disableMentions: 'all'})
		await msg.delete({timeout: 300,reason: await l.translate('reason',msg.author.tag)})
	}
	
}