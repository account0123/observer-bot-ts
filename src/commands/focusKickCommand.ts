import { Message } from "discord.js"
import { CancelCommand, KickCommand } from "."
import { MemberFinder } from "../util/MemberFinder"
import { Lang } from "./lang/Lang"

export class FocusKickCommand {
	requiredArgs: number = 2
	commandNames: string[] = ['focuskick','fk']
	guildExclusive: boolean = true
	shortdescription: string = 'info.focuskick.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.focuskick.usage'
	examples: string[] = ['10m @troll123 stop trolling', '10s 123456789987654321 10 9 8 7... 0']
	permission: string = 'KICK_MEMBERS'
	kick:KickCommand
	constructor(){
		this.kick = new KickCommand()
	}
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const time = args.shift()!
		const secondsEx = time.match(/\d+s/)
		const minutesEx = time.match(/\d+m/)
		const hoursEx = time.match(/\d+h/)
		const daysEx = time.match(/\d+d/)
		var s = 0,m = 0,h = 0,d = 0
		if(secondsEx) s = parseInt(secondsEx[0])
		if(minutesEx) m = parseInt(minutesEx[0])
		if(hoursEx) h = parseInt(hoursEx[0])
		if(daysEx) d = parseInt(daysEx[0])
		const ms = d * 36000000 * 24 + h * 3600000 + m * 60000 +  s * 1000
		if(ms > 2147483647){
			l.send('errors.unsafe_integer')
			return
		}
		const mention = args.shift()!
		const member = MemberFinder.getMember(msg,mention)
		if(!member){
			l.reply('errors.invalid_member',mention)
			return
		}
		if(CancelCommand.timers.length > 9){
			l.reply('errors.enough_timers')
			return
		}
		const reason = args.join(' ') || await l.translate('info.focusban.default')
		await l.send('info.focuskick.success','' + ms/1000,member.displayName, reason)
		const timeout = setTimeout(() => {
			this.kick.run(msg,l,[member.id].concat(args))
		}, ms);
		CancelCommand.timers.push({user: member.id, command: 'Kick', timeout, reason})
	}
	checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		return this.kick.checkPermissions(msg,l)
	}
}