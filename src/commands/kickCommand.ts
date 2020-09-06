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
	async run(msg: Message, args: string[]): Promise<void> {
		const mod = msg.guild!.member(msg.author)!
		const mention = args.splice(0,1).toString()
		const reason = args.join(' ') || '*No hubo una razón específica, pero seguro fue por algo malo*'
		const member = MemberFinder.getMember(msg, mention);
		if(!member){
			msg.reply('el miembro mencionado no es válido.')
			return
		}
		if(!member.bannable){
			msg.reply('no puedes exoulsar al miembro')
			return
		}
		await member.kick(reason).then(kicked => {
			const embed = new MessageEmbed()
				.setAuthor(`¡Fuiste expulsado de ${kicked.guild.name}!`, msg.client.user!.avatarURL()!)
				.setTitle('Razón:')
				.setDescription(reason)
				.setFooter(`Admin: ${mod.user.tag}`);
			kicked.send(embed);
		});
	}
	async checkPermissions(msg: Message, l:Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
			l.reply('errors.botperms.kick',msg)
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
			l.reply('errors.modperms.kick',msg)
			return false
		}
		return true
	}
}
