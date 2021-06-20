import { Message, GuildMember, Permissions } from "discord.js";
import { GetPassCommand } from ".";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class RenameEveryoneCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['renameeveryone']
	guildExclusive: boolean = true
	shortdescription: string = 'info.renameeveryone.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.renameeveryone.usage'
	examples: string[] = ['532bac343f35cd2331', '532bac343f35cd2331 [Hunter]']
	permission: string = ''
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		if(!GetPassCommand.validatePassword(msg.author.id, l, args.shift()!)) return
		const asyncForEach = async (a:GuildMember[], callback: { (r: GuildMember): Promise<void>; (arg0: GuildMember, arg1: number, arg2: GuildMember[]): any; }) => {
			for (let i = 0; i < a.length; i++) {
			  await callback(a[i], i, a)
			}
		  }
		const restart = async () => {
			await asyncForEach(msg.guild!.members.cache.array(), async (member:GuildMember) => {
				const name = member.user.username
			  await member.setNickname(args.join(' ')  + ' ' + name || '')
				  .catch(e=>{
					  l.send('info.renameeveryone.error', member.displayName)
					  console.error(e.stack)
				  });
			  });
			l.send('info.renameeveryone.success')
		}
		restart()
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.botperms.rename_member')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.rename_member')
			return false
		}
		return true
	}
	
}