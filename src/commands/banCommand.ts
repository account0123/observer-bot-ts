import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Lang } from "./lang/Lang";
import console from "console";

export class BanCommand implements ArgCommand {
	permission: string = 'BAN_MEMBERS'
	shortdescription: string = 'info.ban.description'
	fulldescription: string = this.shortdescription
	guildExclusive: boolean = true
	commandNames: string[] = ['ban'];
	requiredArgs: number = 1;
	examples: string[] = ['@user#1234 because reasons', '123456789987654321 multiaccount use'];
	usage: string = 'info.ban.usage'
	type = 'mod'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const mod = msg.guild!.member(msg.author)!
		const mention = args.splice(0,1).toString()
		const reason = args.join(' ')  || await l.translate('info.ban.embed.default_reason')
		const member = MemberFinder.getMember(msg, mention);
		if(!member){
			l.reply('errors.invalid_member',mention)
			return
		}
		if(!member.bannable){
			l.reply('errors.bot_lower')
			return
		}
		await member.ban({days:1, reason: reason}).then(async banned => {
			l.send('info.ban.success',banned.user.tag,msg.guild!.name)
			const e = 'info.ban.embed.'
			const embed = new MessageEmbed()
				.setAuthor(await l.translate(e+'title',banned.guild.name), msg.client.user!.avatarURL()!)
				.setTitle(await l.translate(e+'reason')).setDescription(reason)
				.setFooter(await l.translate(e+'footer') + `: ${mod.user.tag}`).setTimestamp();
			banned.send(embed).catch(e=>console.error(`No se pudo enviar el mensaje a ${banned.displayName} por ${e}`));
		}).catch(error => {
			l.send('info.ban.error',member.user.tag,error)
			console.error(`Se intentó banear a ${member.displayName} (${member.id}) de ${msg.guild!.name} (${msg.guild!.id}) pero falló por ${error.stack}`)
		});
	}
	async checkPermissions(msg: Message,l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			l.reply('errors.botperms.ban')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			l.reply('errors.modperms.ban')
			return false
		}
		return true
	}
}
