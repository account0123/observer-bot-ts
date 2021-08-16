import ArgCommand from "./commandArgInterface";
import { Message, TextChannel } from "discord.js";
import { Lang } from "./lang/Lang";
import { ChannelFinder } from "../util/ChannelFinder";

export class SayCommand implements ArgCommand {
	type: string | undefined;
	permission = ''
	shortdescription = 'info.say.description'
	fulldescription: string = this.shortdescription
	async checkPermissions(): Promise<boolean> {
		return true
	}
	commandNames: string[] = ['say', 'tell', 'speak']
	requiredArgs = 1
	examples: string[] = ['Hello world!!!','Hay pelotudos y luego estás tú']
	usage = 'info.say.usage'
	guildExclusive = false
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const text = args.join(' ')
		const regex = /to ([\w]+)$/m
		const m = text.match(regex)
		if(m && msg.guild && msg.client.user){
			const bot = msg.guild.member(msg.client.user)
			if(!bot) return
			const channel = ChannelFinder.getChannel(msg, m[1])
			if(!channel) return
			const p = channel.permissionsFor(bot)
			if(!p) return
			if(channel && channel.type === 'text' && p.has('SEND_MESSAGES')){
				const textchannel = <TextChannel> channel
				await textchannel.send(text.replace(regex,''), {disableMentions: 'everyone'})
				return
			}
		}
		await msg.channel.send(text,{disableMentions: 'all'})
		await msg.delete({timeout: 300,reason: await l.translate('reason',msg.author.tag)})
	}
	
}