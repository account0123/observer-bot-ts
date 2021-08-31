import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Lang } from "./lang/Lang";
import console from "console";
import { PermissionsChecker } from "../util/PermissionsChecker";
import { RowDataPacket } from "mysql2";
import { Connections } from "../config/connections";

export class BanCommand implements ArgCommand {
	permission = 'BAN_MEMBERS'
	shortdescription = 'info.ban.description'
	fulldescription: string = this.shortdescription
	guildExclusive = true
	commandNames: string[] = ['ban'];
	requiredArgs = 1;
	examples: string[] = ['@user#1234 because reasons', '123456789987654321 multiaccount use'];
	usage = 'info.ban.usage'
	type = 'mod'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		if(!msg.guild) return
		const g = msg.guild
		const mod = msg.guild.member(msg.author)
		if(!mod) return
		const mention = args.splice(0,1).toString()
		const reason = args.join(' ')  || await l.translate('info.ban.embed.default_reason')
		const member = MemberFinder.getMember(msg, mention);
		if(!member){
			msg.react('❌')
			l.reply('errors.invalid_member', mention)
			return
		}
		if(!member.bannable){
			msg.react('❌')
			l.reply('errors.lower_bot')
			return
		}
		await member.ban({days:1, reason: reason}).then(async banned => {
			const [r] = await Connections.db.query<RowDataPacket[]>('SELECT warnings, kicks, bans FROM users WHERE id=?', [banned.id])
			const w: number[] = r.map((r)=>r.warnings), k: number[] = r.map((r)=>r.kicks), b: number[] = r.map((r)=>r.bans)
			let warnings = 0, kicks = 0, bans = 0
			if(w.length > 0){
				warnings = w.sort((a,b)=>a - b)[0]
				kicks = k.sort((a,b)=>a - b)[0]
				bans = b.sort((a,b)=>a - b)[0]
			}
			Connections.db.execute('INSERT INTO users values(?, ?, ?, ?, ?, ?)', [banned.id, banned.guild.id, warnings, kicks, bans + 1, reason])
			l.send('info.ban.success',banned.user.tag,g.name)
			if(!msg.client.user) return
			const e = 'info.ban.embed.'
			const embed = new MessageEmbed()
				.setAuthor(await l.translate(e+'title',banned.guild.name), msg.client.user.avatarURL() || undefined)
				.setTitle(await l.translate(e+'reason')).setDescription(reason)
				.setFooter(await l.translate(e+'footer') + `: ${mod.user.tag}`).setTimestamp();
			banned.send(embed).catch(e=>console.error(`No se pudo enviar el mensaje a ${banned.displayName} por ${e}`));
		}).catch(error => {
			l.send('info.ban.error',member.user.tag,error)
			console.error(`Se intentó banear a ${member.displayName} (${member.id}) de ${g.name} (${g.id}) pero falló por ${error.stack}`)
		});
	}
	async checkPermissions(msg: Message,l: Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const mod = msg.guild.member(msg.author)
		const bot = msg.guild.member(msg.client.user)
		if(!mod || !bot) return false
		if (!bot.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			l.reply('errors.botperms.ban')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			l.reply('errors.modperms.ban')
			return false
		}
		return PermissionsChecker.check(new Permissions(['SEND_MESSAGES']), msg, l)
	}
}
