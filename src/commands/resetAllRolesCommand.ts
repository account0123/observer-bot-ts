import ArgCommand from "./commandArgInterface";
import { Message, Permissions, Role} from "discord.js";
import { GetPassCommand } from ".";
import console from "console";
import { Lang } from "./lang/Lang";
import { MemberFinder } from "../util/MemberFinder";

export class ResetAllRolesCommand implements ArgCommand {
	requiredArgs = 1
	commandNames: string[] = ['resetallroles']
	guildExclusive = true
	shortdescription = 'info.resetallroles.description'
	fulldescription = 'info.resetallroles.fulldescription'
	usage = 'info.resetallroles.usage'
	examples: string[] = ['832abc370fa879d2', '832abc370fa879d2 13b9c4']
	permission = 'MANAGE_ROLES'
	type = 'manage'
	async run(msg: Message,l: Lang, args: string[]): Promise<void> {
		if(!msg.guild) return
		if(!GetPassCommand.validatePassword(msg.author.id, msg.guild.id, l, args[0])) return
		let perms = 0
		if (args[1]) {
			perms = parseInt(args[1],16)
			if(isNaN(perms)){
				l.reply('errors.NaN',args[1])
				await l.send('cancelling').then(m=>setTimeout(m.delete, 1000))
				l.send('canceled')
				return
			}
		}
		if(!msg.guild || !msg.client.user) return
		const bot = msg.guild.members.resolve(msg.client.user)
		if(!bot) return
		const botperms = bot.permissions.bitfield
		const b_perms = BigInt(perms)
		if (!bot.permissions.has(8n) && perms > botperms) {
			l.reply('info.resetallroles.permission_limit',new Permissions(b_perms - botperms).toArray().join(', '))
			await l.send('cancelling').then(m=>setTimeout(m.delete, 1000))
			l.send('canceled')
			return
		}
		const botposition = bot.roles.highest.position
		await l.send('info.resetallroles.start','' + (botposition -1),new Permissions(b_perms).toArray().join(', '))
		const asyncForEach = async (a:Role[], callback: { (r: Role): Promise<void>; (arg0: Role, arg1: number, arg2: Role[]): Promise<void>; }) => {
			for (let i = 0; i < a.length; i++) {
				await new Promise<void>((res)=>setTimeout(()=>res(), 500))
				await callback(a[i], i, a)
			}
		}
		const restart = async () => {
			if(!msg.guild) return
			await asyncForEach([...msg.guild.roles.cache.values()], async (r:Role) => {
			if (botposition > r.position) await r.setPermissions(b_perms,await l.translate('reason',msg.author.tag))
				.catch(e=>{
					l.send('info.resetallroles.error', r.toString())
					console.error(e.stack)
				});
			});
			l.send('info.resetallroles.success')
		}
		restart()
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const mod = MemberFinder.getMember(msg, msg.author.id)
		const bot = MemberFinder.getMember(msg, msg.client.user.id)
		if(!mod || !bot) return false
		if (!mod.permissions.has(Permissions.FLAGS.MANAGE_ROLES)){
			l.reply('errors.botperms.edit_role')
			return false
		}
		if (!bot.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.edit_role')
			return false
		}
		return true
	}
	
}
  