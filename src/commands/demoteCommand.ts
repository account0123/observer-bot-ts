import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Lang } from "./lang/Lang";

export class DemoteCommand implements ArgCommand {
	permission: string = 'MANAGE_ROLESS'
	shortdescription: string = 'info.demote.description'
	fulldescription: string = this.shortdescription
	commandNames: string[] = ['demote']
	requiredArgs: number = 1
	examples: string[] = ['@usuario#1234 abuso de poder']
	usage: string = 'info.demote.usage'
	guildExclusive: boolean = true
	type = 'manage'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const mention = args.shift()!
		const member = MemberFinder.getMember(msg,mention)
		const mod = msg.guild!.member(msg.author)!
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
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.botperms.remove_role')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.remove_role')
			return false
		}
		return true
	}	
}