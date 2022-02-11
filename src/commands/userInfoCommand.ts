import ArgCommand from "./commandArgInterface";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Time } from "../util/Time";
import { Lang } from "./lang/Lang";

export class UserInfoCommand implements ArgCommand {
	requiredArgs = 0
	commandNames: string[] = ['user', 'userinfo', 'memberinfo','aboutmember']
	guildExclusive = true
	shortdescription = 'info.userinfo.description'
	fulldescription = 'info.userinfo.fulldescription'
	usage = 'info.userinfo.usage'
	examples: string[] = ['', '123456789987654321', '@user#1234', '@nickname#1234']
	permission = ''
	type = 'info'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		let embed: Promise<MessageEmbed>
		const mod = MemberFinder.getMember(msg, msg.author.id)
		if(!mod) return
		const details = args.includes('--details') && mod.permissions.has(8n)
		if((args.length > 0 && !details) || args.length > 1){
			const mention = args.join(' ').trim()
			const member = MemberFinder.getMember(msg,mention)
			if (!member) {
				l.reply('errors.invalid_member',mention)
				return
			}
			embed = userEmbed(member,l,details)
		}else{
			if(!msg.guild) return
			const m = MemberFinder.getMember(msg, msg.author.id)
			if(!m) return
			embed = userEmbed(m,l,details)
		}
		embed.then(e=>msg.channel.send({embeds: [e]}))
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
}
async function userEmbed(member:GuildMember, l: Lang, showDetails:boolean) {
	const e = 'info.userinfo.embed.'
	const creationdate = new Time(member.id, l).toString()
	const joindate = new Time(member.joinedAt, l).toString()
	const embed = new MessageEmbed()
		.setAuthor({name: member.id, url: member.displayAvatarURL()})
		.setThumbnail(member.user.displayAvatarURL({dynamic:true}))
		.setColor(member.displayColor)
	if (member.nickname) embed.addField(await l.translate(e+'nickname'),member.nickname,true)
	embed.addFields(
			{name: await l.translate(e+'name'), value: member.user.username, inline:true},
			{name: await l.translate(e+'discriminator'), value: member.user.discriminator, inline: true},
			{name: await l.translate(e+'created'), value: creationdate},
			{name: await l.translate(e+'joined'), value: joindate});
	if (showDetails) {
		embed.addFields([
			{name: 'Roles', value: [...member.roles.cache.values()].join(', '),inline: true},
			{name: await l.translate(e+'permissions'), value: member.permissions.toArray().join(', ')}
		]);
	}else{
		embed.addFields([
			{name: 'Roles*', value: String(member.roles.cache.size),inline: true},
			{name: await l.translate(e+'permissions') + '*', value: member.permissions.bitfield.toString(16)}
		]).setFooter({text: await l.translate(e+'footer')});
	}
	return embed;
}