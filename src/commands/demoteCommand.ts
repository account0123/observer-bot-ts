import ArgCommand from "./commandArgInterface";
import { Message } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Lang } from "./lang/Lang";

export class DemoteCommand implements ArgCommand {
	permission = 'MANAGE_ROLESS'
	shortdescription = 'info.demote.description'
	fulldescription: string = this.shortdescription
	commandNames: string[] = ['demote']
	requiredArgs = 1
	examples: string[] = ['@usuario#1234 abuso de poder']
	usage = 'info.demote.usage'
	guildExclusive = true
	type = 'manage'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		if(!msg.guild) return
		const mention = args.shift() || ''
		const member = MemberFinder.getMember(msg.guild,mention)
		const mod = MemberFinder.getMember(msg.guild, msg.author.id)
		if(!mod) return
		if(!member){
			l.reply('errors.invalid_member',mention)
			return
		}
		if(!member.manageable){
			l.reply('errors.lower_bot')
			return
		}
		const role = member.roles.highest
		if(!(mod.roles.highest.position > role.position)){
			l.reply('info.demote.asbuddy')
			return
		}
		await member.roles.remove(role,args.join(' ') || await l.translate('reason',msg.author.tag)).then(m=>l.send('info.demote.success',msg.author.tag,member.user.tag,role.name,m.roles.highest.name)).catch(e=>{
		l.send('info.demote.error',e)
		console.error(`Se intento eliminar el rol **${role.name}** a ${member.displayName} pero falló por`)
		console.error(e.stack)
		})
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!bot) return false
		if (!bot.permissions.has('ManageRoles')) {
			l.reply('errors.botperms.remove_role')
			return false
		}
		return true
	}	
}