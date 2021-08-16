import ArgCommand from "./commandArgInterface";
import { Message, GuildMember, MessageEmbed } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { Time } from "../util/Time";
import { UserActivity } from "../util/UserActivity";
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
		const details = args.includes('--details')
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
			const m = msg.guild.member(msg.author)
			if(!m) return
			embed = userEmbed(m,l,details)
		}
		await embed.then(e=>msg.channel.send(e))
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
}
async function userEmbed(member:GuildMember, l: Lang, showDetails:boolean) {
	const activity = new UserActivity(member.user).toString()
	const e = 'info.userinfo.embed.'
	const creationdate = new Time(member.id, l).toString()
	const joindate = new Time(member.joinedAt, l).toString()
	const embed = new MessageEmbed()
		.setAuthor(member.id, member.user.displayAvatarURL())
		.setThumbnail(member.user.displayAvatarURL({dynamic:true}))
		.setColor(member.displayColor)
	if (member.nickname) embed.addField(await l.translate(e+'nickname'),member.nickname,true)
	embed.addFields(
			{name: await l.translate(e+'name'), value: member.user.username, inline:true},
			{name: await l.translate(e+'discriminator'), value: member.user.discriminator, inline: true},
			{name: await l.translate(e+'created'), value: creationdate},
			{name: await l.translate(e+'joined'), value: joindate});
	if (showDetails) {
		embed.addFields(
			{name: 'Roles', value: member.roles.cache.array(),inline: true},
			{name: await l.translate(e+'permissions'), value: member.permissions.toArray()},
			{name: await l.translate(e+'activity'), value: activity,inline: true}
		);
	}else{
		embed.addFields(
			{name: 'Roles*', value: member.roles.cache.size,inline: true},
			{name: await l.translate(e+'permissions') + '*', value: member.permissions.bitfield.toString(16)},
			{name: await l.translate(e+'activity'), value: activity,inline: true}
		).setFooter(await l.translate(e+'footer'));
	}
	return embed;
}