import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Lang } from "./lang/Lang";

export class BanCommand implements ArgCommand {
	permission: string = 'Banear miembros'
	shortdescription: string = 'Banea a un miembro del servidor con o sin razón.'
	fulldescription: string = this.shortdescription
	guildExclusive: boolean = true
	commandNames: string[] = ['ban'];
	requiredArgs: number = 1;
	examples: string[] = ['@usuario#1234 por alguna razón', '123456789987654321 uso de multicuentas'];
	usage: string = '<usuario> [razón]'
	async run(msg: Message, args: string[]): Promise<void> {
		const mod = msg.guild!.member(msg.author)!
		const mention = args.splice(0,1).toString()
		const reason = args.join(' ')  || '*No hubo una razón específica, pero seguro fue por algo malo*'
		const member = MemberFinder.getMember(msg, mention);
		if(!member){
			msg.reply('el miembro mencionado no es válido.')
			return
		}
		if(!member.bannable){
			msg.reply('no puedes banear al miembro')
			return
		}
		await member.ban({reason: reason}).then(banned => {
			const embed = new MessageEmbed()
				.setAuthor(`¡Fuiste baneado de ${banned.guild.name}!`, msg.client.user!.avatarURL()!)
				.setTitle('Razón:')
				.setDescription(reason)
				.setFooter(`Admin: ${mod.user.tag}`);
			banned.send(embed);
		}).catch(error => {
			if(error.code == 40007) msg.reply('el miembro ya fue baneado.')
		});
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			msg.reply('no tengo el permiso para banear.')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			msg.reply('no tienes permiso para banear.')
			return false
		}
		return true
	}
}
