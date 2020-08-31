import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";

export class KickCommand implements ArgCommand {
	permission: string = 'Expulsar miembros'
	shortdescription: string = 'Expulsa a un miembro del servidor con o sin razón.'
	fulldescription: string = this.shortdescription
	guildExclusive: boolean = true
	commandNames: string[] = ['kick'];
	requiredArgs: number = 1;
	examples: string[] = ['@usuario#1234 por alguna razón', '123456789987654321 no respetar las reglas'];
	usage: string = '<usuario> [razón]';
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
		}).catch(error => {
			if(error.code == 40007) msg.reply('el miembro ya fue expulsado.')
		});
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
			msg.reply('no tengo el permiso para expulsar.')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
			msg.reply('no tienes permiso para expulsar.')
			return false
		}
		return true
	}
}
