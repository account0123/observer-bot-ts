import ArgCommand from "./commandArgInterface"
import { Message, Permissions, TextChannel } from "discord.js"
import { Lang } from "./lang/Lang"
import { FormatCommand } from "./formatCommand"

export class CopyCommand implements ArgCommand {
  requiredArgs = 1
  usage = 'info.copy.usage'
  examples: string[] = ['https://discord.com/channels/123456789/234567891/345678912', '345678912']
  permission = 'MANAGE_MESSAGES'
  shortdescription = 'info.copy.description'
  fulldescription: string = this.shortdescription
  guildExclusive = true
  commandNames = ['copy']
  type = 'mod'
  async run(msg: Message, l:Lang, args: string[]): Promise<void> {
    const linkOrID = args[0]
	const isLink = isNaN(parseInt(linkOrID, 10))
	let channelID
	let messageID
	if(isLink){
		const frag = linkOrID.replace('https://discord.com/channels/','')
		const coincidences = frag.match(/\d+/g)
		if(!coincidences || coincidences.length < 3) return Promise.reject('invalid link')
		console.log(coincidences)
		const [g, c, m] = coincidences
		console.log('ID de server: %s\nID de canal: %s\nID de mensaje: %s', g, c, m)
		// Another guild?
		if(msg.guild && (msg.guild.id != g)){
			l.send('info.copy.ext_guild')
			return
		}

		channelID = c
		messageID = m
	}else{
		channelID = msg.channel.id
		messageID = linkOrID
	}

	if(!FormatCommand.webhooks) FormatCommand.webhooks = new Map()
	let webhook = FormatCommand.webhooks.get(msg.channel.id)
	if(!msg.guild || !msg.client.user) return
	const bot = msg.guild.member(msg.client.user)
	if(!bot) return
	if(!webhook && msg.channel.type != 'dm'){
		if(bot.hasPermission(Permissions.FLAGS.MANAGE_WEBHOOKS)){
			webhook = await msg.channel.createWebhook('Clone', {
				avatar: 'https://i.imgur.com/n1MdeHO.png',
			});

			const channel = await msg.client.channels.fetch(channelID, false, true)
			if(!channel) return Promise.reject('invalid link')
			if(!(channel instanceof TextChannel)) return Promise.reject('invalid link')
			const message = await channel.messages.fetch(messageID, false, true)
			if(!message){
				l.send('errors.invalid_message', messageID)
				return
			}
			const files: string[] = []
			if(message.attachments.size > 0)
				message.attachments.forEach(a=>files.push(a.url));

			FormatCommand.webhooks.set(msg.channel.id,webhook)
			const user = message.author
			await webhook.send(`${message.content} ${files.join(' ')}`,{
				username: user.username,
				avatarURL: user.displayAvatarURL({dynamic:true}),
				disableMentions: 'all'
			}).then(()=>msg.delete());
		}else{
			const channel = await msg.client.channels.fetch(channelID, false, true)
			if(!channel) return Promise.reject('invalid link')
			if(!(channel instanceof TextChannel)) return Promise.reject('invalid link')
			const message = await channel.messages.fetch(messageID, false, true)
			if(!message){
				l.send('errors.invalid_message', messageID)
				return
			}
			const files: string[] = []
			if(message.attachments.size > 0)
				message.attachments.forEach(a=>files.push(a.url));
			
			await msg.channel.send(`${message.content} ${files.join(' ')}`)
			return
		}
	}
  }

  async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
	if(!msg.guild || !msg.client.user) return false
	const mod = msg.guild.member(msg.author)
	const bot = msg.guild.member(msg.client.user)
	if(!mod || !bot) return false
	if (!bot.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
		l.reply('errors.botperms.clean')
		return false
	}
	if (!mod.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
		l.reply('errors.modperms.clean')
		return false
	}
	return true
  }
}