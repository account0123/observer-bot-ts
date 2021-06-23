import { DMChannel, Message, MessageReaction, Permissions, User } from "discord.js";
import Command from "./commandInterface";
import { Lang } from "./lang/Lang";

export class CreateWebhookCommand implements Command {
	commandNames: string[] = ['createwebhook', 'createwh', 'cwh']
	guildExclusive: boolean = true
	shortdescription: string = 'info.createwebhook.description'
	fulldescription: string = this.shortdescription
	type = 'mod'
	async run(msg: Message, l: Lang): Promise<void> {
		const bot = msg.guild!.member(msg.client.user!)!
		const mod = msg.guild!.member(msg.author)!
		if(!bot.hasPermission(Permissions.FLAGS.MANAGE_WEBHOOKS)){
			l.reply('errors.botperms.create_webhook')
			return
		}
		if(!mod.hasPermission(Permissions.FLAGS.MANAGE_WEBHOOKS)){
			l.reply('errors.modperms.create_webhook')
			return
		}
		const success = await l.translate('info.createwebhook.success')
		const fail = await l.translate('errors.dm_closed')
		const channel = msg.channel
		if(channel instanceof DMChannel) return
		const q = await l.send('info.createwebhook.name_question')
		const f = (reaction: MessageReaction, user: User)=> user.id === msg.author.id && reaction.emoji.name === '❌'
		const f2 =  (reaction: MessageReaction, user: User)=> user.id === msg.author.id
		const collector = q.channel.createMessageCollector(f2, {time: 60000})
		collector.once('collect', (m: Message)=>{
			const name = m.content
			channel.createWebhook(name).then(w=>msg.author.send(success).catch(()=>msg.channel.send(fail))).catch((error)=>{
				if(error.code === 30007) l.send('info.createwebhook.30007')
			})
		});
		q.createReactionCollector(f, {time: 10000}).once('collect', ()=>{
			collector.emit('end')
			l.send('canceled')
		});

	}
	
}