import { Message } from "discord.js";
import { BanCommand } from ".";
import { MemberFinder } from "../util/MemberFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class FocusBanCommand implements ArgCommand {
	requiredArgs: number = 2
	commandNames: string[] = ['focusban','fb']
	guildExclusive: boolean = true
	shortdescription: string = 'info.focusban.description'
	fulldescription: string = this.shortdescription
	usage: string = '<tiempo> <usuario> [razón]'
	examples: string[] = ['10m @troll123 bye bye', '10s 123456789987654321 admin abuse']
	permission: string = 'BAN_MEMBERS'
	ban:BanCommand
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
		const ms = d * 36000000 * 24 + h * 3600000 + m * 60000 +  s * 1000
		if(ms > Number.MAX_SAFE_INTEGER){
			l.send('errors.unsafe_integer')
			return
		}
		const member = MemberFinder.getMember(msg,args.shift()!)
		if(!member){
			l.reply('errors.invalid_member')
			return
		}
		await l.send('info.focusban.success','' + ms/1000,member.displayName,args.join(' ') || await l.translate('info.focusban.default'))
		setTimeout(() => {
			this.ban.run(msg,l,[member.id].concat(args))
		}, ms);
	}
	checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		return this.ban.checkPermissions(msg,l)
	}
}