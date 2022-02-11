import { Permissions, Message, GuildTextBasedChannel } from "discord.js";
import { Lang } from "../commands/lang/Lang";
import { MemberFinder } from "./MemberFinder";

export class PermissionsChecker {
	static async check(permissions: Permissions, msg: Message, l: Lang): Promise<boolean>{
		if(!msg.client.user) return false
		const bot = MemberFinder.getMember(msg, msg.client.user.id)
		if(!bot) return false
		const perms = permissions.toArray()
		const rejected: string[] = []
		const allowed: string[] = []
		for(const p of perms){
			if(bot.permissionsIn(<GuildTextBasedChannel>msg.channel).has(p) || bot.permissions.has(p)){
				allowed.push(await l.translate('permissions.' + p))
				continue
			}
			rejected.push(await l.translate('permissions.' + p))
		}
		if(rejected.length == 0) return true
		if(bot.permissions.has('ADD_REACTIONS')) msg.react('❌')
		const first = await l.translate('checking.first')
        let m: Message | null = null
        if(bot.permissions.has('SEND_MESSAGES')) m = await msg.channel.send(first)
		const missing = await l.translate('checking.missing')
		const list = PermissionsChecker.createPermissionsList(allowed, rejected, missing)
		if(m) m.edit(first + '\n\n' + list)
		return false
	}

	private static createPermissionsList(allowed: string[], rejected: string[], text: string): string {
		let str = ''
		for(const a of allowed){
			str += '✅ ' + a + '\n'
		}
		str += text + '\n'
		for(const r of rejected){
			str += '❎ ' + r + '\n'
		}
		return str
	}
}