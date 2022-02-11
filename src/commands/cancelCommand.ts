import { Message, Permissions, Snowflake } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import Command from "./commandInterface";
import { Lang } from "./lang/Lang";

export class CancelCommand implements Command {
	commandNames: string[] = ['cancel']
	guildExclusive = true
	shortdescription = 'info.cancel.description'
	fulldescription: string = this.shortdescription
	type = 'mod'
	static timers: TimerData[] = []
	async run(msg: Message, l: Lang): Promise<void> {
		if(CancelCommand.timers.length === 0){
			l.send('nothing_to_cancel')
			return
		}
		const e = 'info.cancel.embed.'
		const [target, command, reason] = await Promise.all([l.translate(e+'user'),l.translate(e+'command'), l.translate(e+'reason')]);
		let text = `   ${target}          ${command}  ${reason}\n`
		let i = 0
		const typeReason = (reason: string): string=>{
			if(reason.length > 12) return reason.slice(0,12) + '\n                               ' + typeReason(reason.slice(12));
			else return reason;
		};
		const typeCommand = (command: string)=>{
			if(command === 'Ban') return 'Ban ';
			else return command;
		}
		for (const timer of CancelCommand.timers) {
			if(text.length > 1994) break
			if(i > 10) break
			i++
			const line = `\n${i}. ${timer.user}  ${typeCommand(timer.command)}    ${typeReason(timer.reason)}`
			text += line
		}
		text = '```\n' + text + '\n```'
		const message = await msg.channel.send(text)
		for (let j = 1; j <= i; j++) {
			switch (j) {
				case 1: await message.react('1️⃣'); break;
				case 2: await message.react('2️⃣'); break;
				case 3: await message.react('3️⃣'); break;
				case 4: await message.react('4️⃣'); break;
				case 5: await message.react('5️⃣'); break;
				case 6: await message.react('6️⃣'); break;
				case 7: await message.react('7️⃣'); break;
				case 8: await message.react('8️⃣'); break;
				case 9: await message.react('9️⃣'); break;
				case 10: await message.react('🔟')
			}
		}
		const collector = message.createReactionCollector({time:150000,max:10,maxUsers:3})
		collector.on('collect',(reaction, user)=>{
			let index = 0
			switch(reaction.emoji.name){
				case '1️⃣': index = 1; break;
				case '2️⃣': index = 2; break;
				case '3️⃣': index = 3; break;
				case '4️⃣': index = 4; break;
				case '5️⃣': index = 5; break;
				case '6️⃣': index = 6; break;
				case '7️⃣': index = 7; break;
				case '8️⃣': index = 8; break;
				case '9️⃣': index = 9; break;
				case '🔟': index = 10
			}
			if(CancelCommand.timers.length > index) return
			const timer = CancelCommand.timers[index - 1]
			const allowed = this.checkPermissions(msg, user.id, timer.command)
			if(allowed){
				clearTimeout(timer.timeout)
				l.send('info.cancel.success',timer.command,timer.user)
				CancelCommand.timers.splice(index - 1,1)
			}else{
				l.send('nice_try',timer.command.toLowerCase())
			}
		});
		collector.once('dispose',()=>l.send('info.cancel.timeout'));
	}
	checkPermissions(msg: Message, id: string, command: string): boolean {
		const member = MemberFinder.getMember(msg, id)
		if(member){
			switch (command) {
				case 'Kick':
					if(member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return true
					break
				case 'Ban':
					if(member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return true
			}
		}else return false
		return false
	}
}

export type TimerData = {
	user: Snowflake,
	command: 'Kick'|'Ban',
	timeout: NodeJS.Timeout,
	reason: string
}
