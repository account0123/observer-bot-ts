import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Lang } from "./lang/Lang";
import console from "console";

export class BanCommand implements ArgCommand {
	permission: string = 'Banear miembros'
	shortdescription: string = 'info.ban.description'
	fulldescription: string = this.shortdescription
	guildExclusive: boolean = true
	commandNames: string[] = ['ban'];
	requiredArgs: number = 1;
	examples: string[] = ['@user#1234 because reasons', '123456789987654321 multiaccount use'];
	usage: string = '<user> [reason]'
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
		await member.ban({days:1, reason: reason}).then(banned => {
			const embed = new MessageEmbed()
				.setAuthor(`¡Fuiste baneado de ${banned.guild.name}!`, msg.client.user!.avatarURL()!)
				.setTitle('Razón:')
				.setDescription(reason)
				.setFooter(`Admin: ${mod.user.tag}`);
			banned.send(embed).catch(e=>console.error(`No se pudo enviar el mensaje a ${banned.displayName} por ${e}`));
		}).catch(error => {
			console.error(`Se intentó banear a ${member.displayName} (${member.id}) de ${msg.guild!.name} (${msg.guild!.id}) pero falló por ${error.stack}`)
		});
	}
	async checkPermissions(msg: Message,l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			l.reply('errors.botperms.ban',msg)
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			l.reply('errors.modperms.ban',msg)
			return false
		}
		return true
	}
}
