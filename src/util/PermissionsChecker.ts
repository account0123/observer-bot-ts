import { Permissions, Message } from "discord.js";
import { Lang } from "../commands/lang/Lang";

export class PermissionsChecker {
	static async check(permissions: Permissions, msg: Message, l: Lang): Promise<boolean>{
		const bot = msg.guild!.member(msg.client.user!)!
		const perms = permissions.toArray()
		const rejected: string[] = []
		const allowed: string[] = []
		for(const p of perms){
			if(bot.hasPermission(p)){
				allowed.push(await l.translate('permissions.' + p))
				continue
			}
			rejected.push(await l.translate('permissions.' + p))
		}
		if(rejected.length == 0) return true
		if(bot.hasPermission('ADD_REACTIONS')) msg.react('❌')
		const first = await l.translate('checking.first')
        let m: Message
        if(bot.hasPermission('SEND_MESSAGES')) m = await msg.channel.send(first)
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