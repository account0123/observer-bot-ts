import { Message, MessageEmbed } from "discord.js"
import ArgCommand from "./commandArgInterface"
import { UserFinder } from "../util/UserFinder"

export class AvatarCommand implements ArgCommand {
  permission: string = ''
  shortdescription: string = 'Muestra tu foto (o gif) de perfil'
  fulldescription: string = this.shortdescription
  async checkPermissions(msg: Message): Promise<boolean> {
	  return true
  }
  guildExclusive: boolean = false
  examples: string[] = ['', '@usuario#1234', '123456789987654321']
  requiredArgs: number = 0
  usage: string = '[usuario]'

  commandNames = ['avatar','icon', 'pfp', 'av']

  help(): string {
    return 'Muestra tu foto de perfil o la de alguien más'
  }
  async run(msg: Message, args: string[]): Promise<void> {
	if (args.length > 0) {
		const mention = args[0]
		const user = UserFinder.getUser(msg,mention)!
		if(!user) return
		const e = new MessageEmbed().setDescription(`Avatar de **${user.username}**:`).setImage(user.avatarURL({dynamic:true})!).setFooter('¡Que hermoso sujeto!')
		msg.channel.send(e).then(m => console.log(`Avatar de ${user.id} entergado`)).catch(err=>console.error(err))
	}else{
		const user = UserFinder.getUser(msg,msg.author.id)
		if(!user) return
		const e = new MessageEmbed().setDescription(`**${user.username}**, aquí va tu avatar:`).setImage(user.avatarURL({dynamic:true})!).setFooter('¡Que hermoso sujeto!')
		msg.channel.send(e).then(m => console.log(`Avatar de ${user.id} entergado`)).catch(err=>console.error(err))
	}}
}