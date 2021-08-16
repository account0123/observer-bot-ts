import { Message, Permissions, Role } from 'discord.js';
import { GetPassCommand } from '.';
import { MemberFinder } from '../util/MemberFinder';
import { RoleFinder } from '../util/RoleFinder';
import ArgCommand from './commandArgInterface';
import { Lang } from './lang/Lang';
export class ResetMemberCommand implements ArgCommand {
	requiredArgs = 2
	commandNames: string[] = ['resetmember', 'resetuser', 'resetrolesof']
	guildExclusive = true
	shortdescription = 'info.resetmember.description'
	fulldescription = 'info.resetmember.fulldescription'
	usage = 'info.resetmember.usage'
	examples: string[] = ['@user#1234 3bac6424af', '123456789987654321 3bac6424af 345678912398765432', 'user 3bac6424af 678912345543219876 345678912398765432 891234567876543219']
	permission = ''
	type = 'manage'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		if(!msg.guild) return
		const member_mention = args.shift() || ''
		const member = MemberFinder.getMember(msg, member_mention)
		if(!GetPassCommand.validatePassword(msg.author.id, msg.guild.id, l, args.shift() || '')) return
		if(!member){
			l.reply('errors.invalid_member', member_mention)
			return
		}
		const roles: Role[] = []
		for (const role_id of args) {
			const role = RoleFinder.getRole(msg, role_id)
			if(role) roles.push(role)
		}
		member.roles.set(roles, await l.translate('reason',msg.author.tag)).then(new_member=>{
			if(new_member.roles.cache.size == 0) l.send('info.resetmember.success_empty', new_member.displayName)
			else l.send('info.resetmember.success', new_member.displayName, new_member.roles.cache.map(role=>role.toString()).toString())
		});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const mod = msg.guild.member(msg.author)
		const bot = msg.guild.member(msg.client.user)
		if(!mod || !bot) return false
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