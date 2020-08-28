import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";

export class BanCommand implements ArgCommand {
	guildExclusive: boolean = true
	commandNames: string[] = ['ban'];
	requiredArgs: number = 1;
	examples: string[] = ['@usuario#1234 por alguna razón', '123456789987654321 uso de multicuentas'];
	usage: string = '<usuario> [razón]';
	async run(msg: Message, args: string[]): Promise<void> {
		const id = msg.author.id;
		const mod = msg.guild!.members.cache.get(id)!
		if(!(mod.hasPermission('BAN_MEMBERS'))){ 
			msg.reply(`no tienes el permiso para banear`)
			return
		}
		const mention = args.splice(0,1).toString();
		const reason = args.join(' ');
		const member = MemberFinder.getMember(msg, mention);
		if(!member){
			msg.reply('el usuario mencionado no es válido')
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
			if(!member.bannable) msg.reply('no puedes banear al miembro');
			if(error.code == 40007) msg.reply('el miembro ya fue baneado.')
		});
	}
	
}
