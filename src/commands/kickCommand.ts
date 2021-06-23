import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Lang } from "./lang/Lang";

export class KickCommand implements ArgCommand {
	permission: string = 'KICK_MEMBERS'
	shortdescription: string = 'info.kick.description'
	fulldescription: string = this.shortdescription
	guildExclusive: boolean = true
	commandNames: string[] = ['kick'];
	requiredArgs: number = 1;
	examples: string[] = ['plskickme','@user#1234 for some reasons', '123456789987654321 read the rules'];
	usage: string = 'info.kick.usage';
	type = 'mod'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const mod = msg.guild!.member(msg.author)!
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
			const e = 'info.kick.embed.'
			const embed = new MessageEmbed()
				.setAuthor(await l.translate(e+'title',msg.guild!.name), msg.client.user!.avatarURL()!)
				.setTitle(await l.translate(e+'reason'))
				.setDescription(reason)
				.setFooter(await l.translate(e+'footer',mod.user.tag));
			kicked.send(embed);
		});
	}
	async checkPermissions(msg: Message, l:Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
			l.reply('errors.botperms.kick')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
			l.reply('errors.modperms.kick')
			return false
		}
		return true
	}
}
