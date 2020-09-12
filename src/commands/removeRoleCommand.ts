import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import { Lang } from "./lang/Lang";

export class RemoveRoleCommand implements ArgCommand {
	permission: string = 'MANAGE_ROLES'
	shortdescription: string = 'info.removerole.description'
	fulldescription: string = this.shortdescription
	commandNames: string[] = ['remrole','removerole'];
	requiredArgs: number = 2
	examples: string[] = ['123456789987654321 @Mods', '@usuario#1234 trial admin'];
	usage: string = 'info.removerole.usage'
	guildExclusive: boolean = true
	async run(msg: Message, l:Lang, args: string[]): Promise<void> {
		const mention = args.shift()!
		const member = MemberFinder.getMember(msg,mention)
		const role = RoleFinder.getRole(msg,args.join(' '))
		if (!member) {
			l.reply('errors.invalid_member',mention)
			return
		}
		if (!role) {
			l.reply('errors.invalid_role',args.join(' '))
			return
		}
		await member.roles.remove(role,await l.translate('reason',msg.author.tag)).then(m=>l.send('info.removerole.success',role.name,member.displayName)).catch(e=>{
		l.reply('info.removerole.error',e)
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