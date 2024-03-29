import { EmbedBuilder, Message} from "discord.js"
import ArgCommand from "./commandArgInterface"
import { UserFinder } from "../util/UserFinder"
import { Lang } from "./lang/Lang"
import { MemberFinder } from "../util/MemberFinder"

export class AvatarCommand implements ArgCommand {
  permission = ''
  shortdescription = 'info.avatar.description'
  fulldescription: string = this.shortdescription
  async checkPermissions(): Promise<boolean> {
		return true
  }
  guildExclusive = false
  examples: string[] = ['', '@usuario#1234', '123456789987654321']
  requiredArgs = 0
  usage = 'info.avatar.usage'
  commandNames = ['avatar','icon', 'pfp', 'av']
  type = 'info'
  async run(msg: Message, l: Lang, args: string[]): Promise<void> {
	if (args.length > 0) {
		const mention = args.join(' ')
		const user = UserFinder.getUser(msg, mention)
		if(!user){
			if(msg.guild){	
				const member = MemberFinder.getMember(msg.guild, mention)
				if(member) this.run(msg,l,[member.id])
				else l.reply('errors.invalid_member', mention)
				return
			}
			l.reply('errors.invalid_user',mention)
			return
		}
		const e = new EmbedBuilder().setDescription(await l.translate('info.avatar.user',user.username)).setImage(user.displayAvatarURL({size:1024,forceStatic:true})).setFooter({text: await l.translate('info.avatar.footer')})
		msg.channel.send({embeds:[e]}).then(()=> console.log(`Avatar de ${user.id} entergado`)).catch(err=>console.error(err))
	}else{
		const user = UserFinder.getUser(msg,msg.author.id)
		if(!user) return
		const e = new EmbedBuilder().setDescription(await l.translate('info.avatar.own',user.username))
		.setImage(user.displayAvatarURL({size:1024,forceStatic:true})).setFooter({text: await l.translate('info.avatar.footer')})
		msg.channel.send({embeds:[e]}).then(()=> console.log(`Avatar de ${user.id} entergado`)).catch(err=>console.error(err))
	}}
}