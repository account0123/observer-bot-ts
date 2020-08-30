import ArgCommand from './commandArgInterface'
import {ChannelFinder} from '../util/ChannelFinder'
import {Message, Permissions, GuildChannel} from 'discord.js'
import { utils, ModeOfOperation} from 'aes-js'
import { GetPassCommand } from './getPassCommand'
export class DeleteChannelCommand implements ArgCommand{
	permission: string = 'Gestionar canales'
	shortdescription: string = 'Borra un canal.'
	fulldescription: string = 'Borra un canal. La contraseña se adquiere con el comando `getpass` invocado por cualquier administrador.'
	commandNames:string[]=['deletechannel']
	guildExclusive:boolean=true
	requiredArgs:number=2
	usage:string='<canal> <contraseña>'
	examples:string[]=['123456789987654321 1234', 'canal-nuevo 1234']
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
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			msg.reply('no tengo el permiso para eliminar canales.')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			msg.reply('no tienes permiso para eliminar canales.')
			return false
		}
		return true
	}
}