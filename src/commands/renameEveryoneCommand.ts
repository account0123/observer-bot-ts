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
        const bot_role = msg.guild!.member(msg.client.user!)!.roles.highest
        const members = msg.guild!.members.cache.array().filter((m)=>m.roles.highest.comparePositionTo(bot_role) < 0)
		if(members.length == 0){
			msg.react('❌')
			l.send('info.renameeveryone.miss')
			return
		}
		if(args.length == 0){
			let count = 0
        	for(const m of members){
        	    if(m.nickname == null) continue;
				count++
        	}
        	if(count == 0){
				msg.react('❌')
				l.send('info.renameeveryone.no_hit')
				return
			}
		}
		const asyncForEach = async (a:GuildMember[], callback: { (r: GuildMember): Promise<void>; (arg0: GuildMember, arg1: number, arg2: GuildMember[]): any; }) => {
			for (let i = 0; i < a.length; i++) {
			  await callback(a[i], i, a)
			}
		  }
		const restart = async () => {
			await asyncForEach(members, async (member:GuildMember) => {
                const name = member.user.username
                await member.setNickname(args.join(' ')  + ' ' + name || '')
                    .catch(e=>{
					  l.translate('info.renameeveryone.error', member.displayName).then(fb=>msg.author.send(fb))
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