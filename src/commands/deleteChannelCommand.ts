import ArgCommand from './commandArgInterface'
import {ChannelFinder} from '../util/ChannelFinder'
import {Message, Permissions, GuildChannel} from 'discord.js'
export class DeleteChannelCommand implements ArgCommand{
commandNames:string[]=['deletechannel']
guildExclusive:boolean=true
requiredArgs:number=2
usage:string='<canal> <contraseña>'
examples:string[]=['123456789987654321 1234', 'canal-nuevo 1234']
async run(msg:Message,args:string[]){
if(args[1] != '1234'){
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