import {ArgCommand} from './argCommand'
import {ChannelFinder} from '../util/ChannelFinder'
import {Message} from 'discord.js'
export class DeleteChannelCommand implements ArgCommand{
const commandNames:string[]=['deletechannel']
const requiredArgs:number=2
const usage:string='<canal> <contraseña>'
const examples:string[]=['123456789987654321 1234', 'canal-nuevo 1234']
async run(msg:Message,args:string[]){
const mod = msg.guild!.members.cache.get(msg.author!.id)!
if(!mod.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)){
msg.reply('no tienes el permiso para borrar canales')
return
}
const bot = msg.guild!.members.cache.get(msg.client.user!.id)!
if(!bot.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)){
msg.reply('no tengo el permiso para borrar canales')
return
}
if(args[1] != '1234'){
msg.reply('Contraseña incorrecta.')
return
}
const channel = ChannelFinder.getChannel(msg,args[0])
if(!channel){
message.reply('no pude identificar el canal')
return
}
await channel.delete().then(c=>msg.channel.send(`Canal **${c.name}** borrado sin problemas.`))
}}