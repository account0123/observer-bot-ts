import ArgCommand from "./commandArgInterface";
import { Message, Permissions, Role} from "discord.js";
import { GetPassCommand } from ".";
import console from "console";
import { Lang } from "./lang/Lang";

export class ResetAllRolesCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['resetallroles']
	guildExclusive: boolean = true
	shortdescription: string = 'info.resetallroles.description'
	fulldescription: string = 'info.resetallroles.fulldescription'
	usage: string = 'info.resetallroles.usage'
	examples: string[] = ['832abc370fa879d2', '832abc370fa879d2 13b9c4']
	permission: string = 'MANAGE_ROLES'
	type = 'manage'
	async run(msg: Message,l: Lang, args: string[]): Promise<void> {
		if(!GetPassCommand.validatePassword(msg.author.id, msg.guild!.id, l, args[0])) return
		var perms = 0
		if (args[1]) {
			perms = parseInt(args[1],16)
			if(isNaN(perms)){
				l.reply('errors.NaN',args[1])
				await l.send('cancelling').then(m=>m.delete({timeout: 1000}))
				l.send('canceled')
				return
			}
		}
		const bot = msg.guild!.member(msg.client.user!)!
		const botperms = bot.permissions.bitfield
		if (!bot.hasPermission(8) && perms > botperms) {
			l.reply('info.resetallroles.permission_limit',new Permissions(perms - botperms).toArray().join(', '))
			await l.send('cancelling').then(m=>m.delete({timeout: 1000}))
			l.send('canceled')
			return
		}
		const botposition = bot.roles.highest.position
		await l.send('info.resetallroles.start','' + (botposition -1),new Permissions(perms).toArray().join(', '))
		msg.guild!.roles.cache.forEach(async r => {
		})
		const asyncForEach = async (a:Role[], callback: { (r: Role): Promise<void>; (arg0: Role, arg1: number, arg2: Role[]): any; }) => {
		  for (let i = 0; i < a.length; i++) {
			await new Promise<void>((res,rej)=>setTimeout(()=>res(), 500))
			await callback(a[i], i, a)
		  }
		}
		const restart = async () => {
		  await asyncForEach(msg.guild!.roles.cache.array(), async (r:Role) => {
			if (botposition > r.position) await r.setPermissions(perms,await l.translate('reason',msg.author.tag))
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
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)){
			l.reply('errors.botperms.edit_role')
			return false
		}
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.edit_role')
			return false
		}
		return true
	}
	
}
  