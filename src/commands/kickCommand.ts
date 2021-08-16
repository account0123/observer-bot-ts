import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Lang } from "./lang/Lang";
import { PermissionsChecker } from "../util/PermissionsChecker";

export class KickCommand implements ArgCommand {
	permission = 'KICK_MEMBERS'
	shortdescription = 'info.kick.description'
	fulldescription: string = this.shortdescription
	guildExclusive = true
	commandNames: string[] = ['kick'];
	requiredArgs = 1;
	examples: string[] = ['plskickme','@user#1234 for some reasons', '123456789987654321 read the rules'];
	usage = 'info.kick.usage';
	type = 'mod'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		if(!msg.guild || !msg.client.user) return
		const mod = msg.guild.member(msg.author)
		if(!mod) return
		const mention = args.splice(0,1).toString()
		const reason = args.join(' ') || await l.translate('info.kick.embed.default_reason')
		const member = MemberFinder.getMember(msg, mention);
		if(!member){
			l.reply('errors.invalid_member',mention)
			return
		}
		if(!member.bannable){
			l.reply('errors.lower_bot')
			return
		}
		await member.kick(reason).then(async kicked => {
			if(!msg.guild || !msg.client.user) return
			const a = msg.client.user.avatarURL({dynamic: true})
			if(!a) return
			const e = 'info.kick.embed.'
			const embed = new MessageEmbed()
				.setAuthor(await l.translate(e+'title',msg.guild.name), a)
				.setTitle(await l.translate(e+'reason'))
				.setDescription(reason)
				.setFooter(await l.translate(e+'footer',mod.user.tag));
			kicked.send(embed).catch(e=>console.error(`No se pudo enviar el mensaje a ${kicked.displayName} por ${e}`));
		});
	}
	async checkPermissions(msg: Message, l:Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const mod = msg.guild.member(msg.author)
		const bot = msg.guild.member(msg.client.user)
		if(!mod || !bot) return false
		if (!bot.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
			l.reply('errors.botperms.kick')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
			l.reply('errors.modperms.kick')
			return false
		}
		return PermissionsChecker.check(new Permissions(['SEND_MESSAGES']), msg, l)
	}
}
