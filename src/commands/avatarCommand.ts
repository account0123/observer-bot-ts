import { Message, MessageEmbed } from "discord.js"
import ArgCommand from "./commandArgInterface"
import { UserFinder } from "../util/UserFinder"
import { Lang } from "./lang/Lang"
import { MemberFinder } from "../util/MemberFinder"

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
  usage: string = 'info.avatar.usage'
  commandNames = ['avatar','icon', 'pfp', 'av']
  type = 'info'
  async run(msg: Message, l: Lang, args: string[]): Promise<void> {
	if (args.length > 0) {
		const mention = args.join(' ')
		const user = UserFinder.getUser(msg,mention)!
		if(!user){
			if(msg.guild){	
				const member = MemberFinder.getMember(msg, mention)
				if(member) this.run(msg,l,[member.id])
				else l.reply('errors.invalid_member', mention)
				return
			}
			l.reply('errors.invalid_user',mention)
			return
		}
		const e = new MessageEmbed().setDescription(await l.translate('info.avatar.user',user.username)).setImage(user.displayAvatarURL({size:1024,dynamic:true})).setFooter(await l.translate('info.avatar.footer'))
		msg.channel.send(e).then(()=> console.log(`Avatar de ${user.id} entergado`)).catch(err=>console.error(err))
	}else{
		const user = UserFinder.getUser(msg,msg.author.id)
		if(!user) return
		const e = new MessageEmbed().setDescription(await l.translate('info.avatar.own',user.username))
		.setImage(user.displayAvatarURL({size:1024,dynamic:true})).setFooter(await l.translate('info.avatar.footer'))
		msg.channel.send(e).then(()=> console.log(`Avatar de ${user.id} entergado`)).catch(err=>console.error(err))
	}}
}