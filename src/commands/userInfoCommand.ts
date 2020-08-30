import ArgCommand from "./commandArgInterface";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Time } from "../util/Time";
import { UserActivity } from "../util/userActivity";

export class UserInfoCommand implements ArgCommand {
	requiredArgs: number = 0
	commandNames: string[] = ['user', 'userinfo', 'memberinfo','aboutmember']
	guildExclusive: boolean = true
	shortdescription: string = 'Muestra info de un miembro.'
	fulldescription: string = 'Muestra toda la información del miembro indicado o de ti mismo si no hay parámetros'
	usage: string = '[usuario]'
	examples: string[] = ['', '123456789987654321', '@usuario#1234', '@apodo#1234']
	permission: string = ''
	async run(msg: Message, args: string[]): Promise<void> {
		const mention = args.join(' ').trim()
		const member = MemberFinder.getMember(msg,mention)
		if (!member) {
			msg.reply(`el miembro ${mention} no ha sido encontrado `)
			return
		}
		const embed = userEmbed(member)
		await msg.channel.send(embed.setFooter(`Pedido por ${msg.author.tag}`))
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		return true
	}
}
function userEmbed(member:GuildMember) {
	let activity = new UserActivity(member.user).toString()
	const creationdate = new Time(member.id).toString()
	const joindate = new Time(member.joinedAt).toString()
	const embed = new MessageEmbed()
		.setAuthor(member.id, member.user.displayAvatarURL())
		.setThumbnail(member.user.displayAvatarURL({dynamic:true}))
		.addFields(
			{name: 'Nombre', value: member.user.username, inline:true},
			{name: 'Discriminador', value: member.user.discriminator, inline: true},
			{name: 'Fecha de creación', value: creationdate},
			{name: 'Fecha de ingreso', value: joindate},
			{name: 'Roles', value: member.roles.cache.array(),inline: true},
			{name: 'Actividad actual', value: activity,inline: true}
		)
	return embed;
}