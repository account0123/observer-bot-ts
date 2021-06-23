import { Message } from "discord.js";
import { BanCommand } from ".";
import { MemberFinder } from "../util/MemberFinder";
import { CancelCommand } from "./cancelCommand";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class FocusBanCommand implements ArgCommand {
	requiredArgs: number = 2
	commandNames: string[] = ['focusban','fb']
	guildExclusive: boolean = true
	shortdescription: string = 'info.focusban.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.focusban.usage'
	examples: string[] = ['10m @troll123 bye bye', '10s 123456789987654321 admin abuse']
	permission: string = 'BAN_MEMBERS'
	type = 'mod'
	private ban:BanCommand
	private index: number | undefined
	constructor(){
		this.ban = new BanCommand()
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
		const ms = d * 3600000 * 24 + h * 3600000 + m * 60000 +  s * 1000
		if(isNaN(ms) || ms > 2147483647){
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
		await l.send('info.focusban.success','' + ms/1000,member.displayName, reason)
		const timeout = setTimeout(() => {
			this.ban.run(msg,l,[member.id].concat(args))
			if(this.index) CancelCommand.timers.splice(this.index,1)
		}, ms);
		this.index = CancelCommand.timers.push({user: member.id, timeout, command: 'Ban', reason})
	}
	checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		return this.ban.checkPermissions(msg,l)
	}
}