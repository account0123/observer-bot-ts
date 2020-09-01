import { Message, MessageEmbed } from "discord.js"
import ArgCommand from "./commandArgInterface"
import { UserFinder } from "../util/UserFinder"
import { Lang } from "./lang/Lang"

export class AvatarCommand implements ArgCommand {
  permission: string = ''
  shortdescription: string = 'info.avatar.description'
  fulldescription: string = this.shortdescription
  async checkPermissions(msg: Message): Promise<boolean> {
	  return true
  }
  guildExclusive: boolean = false
  examples: string[] = ['', '@usuario#1234', '123456789987654321']
  requiredArgs: number = 0
  usage: string = '[usuario]'
  commandNames = ['avatar','icon', 'pfp', 'av']
  async run(msg: Message, args: string[]): Promise<void> {
    const lang = new Lang(msg.guild!.id)
	if (args.length > 0) {
		const mention = args[0]
		const user = UserFinder.getUser(msg,mention)!
		if(!user) return
		const e = new MessageEmbed().setDescription(lang.translate('info.avatar.user',user.username)).setImage(user.avatarURL({dynamic:true})!).setFooter(lang.translate('info.avatar.footer'))
		msg.channel.send(e).then(m => console.log(`Avatar de ${user.id} entergado`)).catch(err=>console.error(err))
	}else{
		const user = UserFinder.getUser(msg,msg.author.id)
		if(!user) return
		const e = new MessageEmbed().setDescription(lang.translate('info.avatar.own',user.username)).setImage(user.avatarURL({dynamic:true})!).setFooter(lang.translate('info.avatar.footer'))
		msg.channel.send(e).then(m => console.log(`Avatar de ${user.id} entergado`)).catch(err=>console.error(err))
	}}
}