import ArgCommand from './commandArgInterface'
import {ChannelFinder} from '../util/ChannelFinder'
import {Message, Permissions, GuildChannel} from 'discord.js'
import { utils, ModeOfOperation} from 'aes-js'
import { GetPassCommand } from './getPassCommand'
import { Lang } from './lang/Lang'
export class DeleteChannelCommand implements ArgCommand{
	permission: string = 'MANAGE_CHANNELS'
	shortdescription: string = 'info.deletechannel.description'
	fulldescription: string = 'info.deletechannel.fulldescription'
	commandNames:string[]=['deletechannel']
	guildExclusive:boolean=true
	requiredArgs:number=2
	usage:string='info.deletechannel.usage'
	examples:string[]=['123456789987654321 1234', 'new-channel 1234']
	async run(msg:Message,l: Lang, args:string[]){
		if(!GetPassCommand.validatePassword(msg.author.id, l, args[1])) return
		const channel = ChannelFinder.getChannel(msg,args[0])
		if(!channel){
			l.reply('errors.invalid_channel',args[0])
			return
		}
		await channel.delete(await l.translate('reason',msg.author.tag)).then((c:GuildChannel)=>l.send('info.deletechannel.success',c.name))
	}
	async checkPermissions(msg: Message,l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			l.reply('errors.botperms.delete_channel')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			l.reply('errors.modperms.delete_channel')
			return false
		}
		return true
	}
}