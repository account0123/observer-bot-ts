import { GuildTextBasedChannel, Message, ThreadChannel } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import Command from "./commandInterface";
import { Lang } from "./lang/Lang";

export class CreateWebhookCommand implements Command {
	commandNames: string[] = ['createwebhook', 'createwh', 'cwh']
	guildExclusive = true
	shortdescription = 'info.createwebhook.description'
	fulldescription: string = this.shortdescription
	type = 'mod'
	async run(msg: Message, l: Lang): Promise<void> {
		if(!msg.guild || !msg.client.user) return
		const mod = MemberFinder.getMember(msg.guild, msg.author.id)
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!mod || !bot) return
		const c = <GuildTextBasedChannel>msg.channel
		if(!bot.permissionsIn(c).has('ManageWebhooks')){
			l.reply('errors.botperms.create_webhook')
			return
		}
		if(!mod.permissionsIn(c).has('ManageWebhooks')){
			l.reply('errors.modperms.create_webhook')
			return
		}
		const success = await l.translate('info.createwebhook.success')
		const fail = await l.translate('errors.dm_closed')
		const channel = <GuildTextBasedChannel>msg.channel
		if(channel instanceof ThreadChannel){
			l.reply('errors.is_thread')
			msg.react('❌').catch()
			return
		}
		const q = await l.send('info.createwebhook.name_question')
		const collector = q.channel.createMessageCollector({time: 60000})
		collector.on('collect', (m: Message)=>{
			if(m.author.id != msg.author.id) return
			channel.createWebhook({name: m.content})
				.then(()=>msg.author.send(success).catch(async ()=>msg.channel.send(fail)))
				.catch((error)=>{
					if(error.code === 30007) l.send('info.createwebhook.30007')
				})
		});
		q.createReactionCollector({time: 10000}).once('collect', (reaction, user)=>{
			if(user.id === msg.author.id && reaction.emoji.name === '❌'){
				collector.emit('end')
				l.send('canceled')
			}
		});

	}
	
}