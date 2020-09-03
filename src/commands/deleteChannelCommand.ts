import ArgCommand from './commandArgInterface'
import {ChannelFinder} from '../util/ChannelFinder'
import {Message, Permissions, GuildChannel} from 'discord.js'
import { utils, ModeOfOperation} from 'aes-js'
import { GetPassCommand } from './getPassCommand'
import { Lang } from './lang/Lang'
export class DeleteChannelCommand implements ArgCommand{
	permission: string = 'Gestionar canales'
	shortdescription: string = 'info.deletechannel.description'
	fulldescription: string = 'info.deletechannel.fulldescription'
	commandNames:string[]=['deletechannel']
	guildExclusive:boolean=true
	requiredArgs:number=2
	usage:string='info.deletechannel.usage'
	examples:string[]=['123456789987654321 1234', 'new-channel 1234']
	async run(msg:Message,args:string[]){
		const encryptedBytes = utils.hex.toBytes(args[1])
		const aesCbc = new ModeOfOperation.cbc(GetPassCommand.key,GetPassCommand.iv)
		const decryptedBytes = aesCbc.decrypt(encryptedBytes)
		const key = utils.utf8.fromBytes(decryptedBytes)
		if(key != msg.author.id.substring(0,16)){
			msg.reply('Contraseña incorrecta.')
			return
		}
		const channel = ChannelFinder.getChannel(msg,args[0])
		if(!channel){
			msg.reply('no pude identificar el canal')
			return
		}
		await channel.delete(`Comando ejecutado por ${msg.author.tag}`).then((c:GuildChannel)=>msg.channel.send(`Canal **${c.name}** borrado sin problemas.`))
	}
	async checkPermissions(msg: Message,l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			l.reply('errors.botperms.delete_channel',msg)
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			l.reply('errors.modperms.delete_channel',msg)
			return false
		}
		return true
	}
}