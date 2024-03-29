import { Message } from "discord.js"
import { CancelCommand, KickCommand } from "."
import { MemberFinder } from "../util/MemberFinder"
import { Lang } from "./lang/Lang"

export class FocusKickCommand {
	requiredArgs = 2
	commandNames: string[] = ['focuskick','fk']
	guildExclusive = true
	shortdescription = 'info.focuskick.description'
	fulldescription: string = this.shortdescription
	usage = 'info.focuskick.usage'
	examples: string[] = ['10m @troll123 stop trolling', '10s 123456789987654321 10 9 8 7... 0']
	permission = 'KICK_MEMBERS'
	type = 'mod'
	private kick:KickCommand
	private index: number | undefined
	constructor(){
		this.kick = new KickCommand()
	}
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const time = args.shift() || ''
		const secondsEx = time.match(/(\d+)s/)
		const minutesEx = time.match(/(\d+)m/)
		const hoursEx = time.match(/(\d+)h/)
		const daysEx = time.match(/(\d+)d/)
		const implicit_duration = parseInt(time, 10)
		let s = 0,m = 0,h = 0,d = 0
		if(secondsEx) s = parseInt(secondsEx[1])
		if(!isNaN(implicit_duration)) s = implicit_duration
		if(minutesEx) m = parseInt(minutesEx[1])
		if(hoursEx) h = parseInt(hoursEx[1])
		if(daysEx) d = parseInt(daysEx[1])
		const ms = d * 3600000 * 24 + h * 3600000 + m * 60000 +  s * 1000
		if(isNaN(ms) || ms > 2147483647){
			l.send('errors.unsafe_integer')
			return
		}
		const mention = args.shift() || ''
		if(!msg.guild) return
		const member = MemberFinder.getMember(msg.guild,mention)
		if(!member){
			l.reply('errors.invalid_member',mention)
			return
		}
		if(CancelCommand.timers.length > 9){
			l.reply('errors.enough_timers')
			return
		}
		// Verificación de timers
		for(const t of CancelCommand.timers){
			if(member.id == t.user){
				msg.channel.send('El miembro `' + t.user + '` ya será expulsado/baneado')
				return
			}
		}
		const reason = args.join(' ') || await l.translate('info.focusban.default')
		await l.send('info.focuskick.success','' + ms/1000,member.displayName, reason)
		const timeout = setTimeout(() => {
			this.kick.run(msg,l,[member.id].concat(args))
			if(this.index) CancelCommand.timers.splice(this.index,1)
		}, ms);
		this.index = CancelCommand.timers.push({user: member.id, command: 'Kick', timeout, reason})
	}
	checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		return this.kick.checkPermissions(msg,l)
	}
}