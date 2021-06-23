import { Message, VoiceChannel } from "discord.js";
import { ChannelFinder } from "../util/ChannelFinder";
import { MemberFinder } from "../util/MemberFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class MuteCommand implements ArgCommand {
	type: string | undefined;
	requiredArgs: number = 3
	commandNames: string[] = ['shutup']
	guildExclusive: boolean = true
	shortdescription: string = 'info.mute.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.mute.usage'
	examples: string[] = ['123456789987654321 from 456789123321987654', '@user#1234 from general-voice for 2 minutes']
	permission: string = ''
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		if(args[0] === 'everyone'){
			const channel = ChannelFinder.getChannel(msg, args[2])
			if(channel){
				const voice_channel = <VoiceChannel> channel
				voice_channel.members.forEach(member=>{
					if(member.id === msg.author.id) return
					member.edit({mute: true})
				});
				if(args.length > 3){
					const n = parseInt(args[4])
					const duration = args[5]
					var ms = 0
					switch (duration) {
						case 'minutes': ms = n * 60 * 1000; break;
						case 'seconds': ms = n * 1000
					}
					setTimeout(()=>{
						voice_channel.members.forEach(m=>m.edit({mute:false}));
					},ms);
				}
			}
		}else{
			const member = MemberFinder.getMember(msg, args[0])
			if(!member){
				l.reply('errors.invalid_member',args[0])
				return
			}
			const channel = ChannelFinder.getChannel(msg, args[2])
			if(channel){
				const voice_channel = <VoiceChannel> channel
				const is_member_connected = voice_channel.members.has(member.id)
				if(is_member_connected) member.edit({mute:true})
				if(args.length > 3){
					const n = parseInt(args[4])
					const duration = args[5]
					var ms = 0
					switch (duration) {
						case 'minutes': ms = n * 60 * 1000; break;
						case 'seconds': ms = n * 1000
					}
					setTimeout(()=>{
						member.edit({mute: false})
					},ms);
				}
			}
		}
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		return true
	}
	
}