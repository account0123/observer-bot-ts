import { CacheType, ChatInputCommandInteraction, ClientUser, EmbedBuilder, GuildMember, Message, PermissionsBitField, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder, User } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { InteractionLang, Lang } from "./lang/Lang";
import console from "console";
import { PermissionsChecker } from "../util/PermissionsChecker";
import { RowDataPacket } from "mysql2";
import { Connections } from "../config/connections";
import SlashCommand from "./slashCommandInterface";

export class BanCommand implements SlashCommand {
	permission = 'BAN_MEMBERS'
	shortdescription = 'info.ban.description'
	fulldescription: string = this.shortdescription
	guildExclusive = true
	commandNames: string[] = ['ban'];
	requiredArgs = 1;
	examples: string[] = ['@user#1234 because reasons', '123456789987654321 multiaccount use'];
	usage = 'info.ban.usage'
	type = 'mod'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		if(!msg.guild) return
		const g = msg.guild
		const mod = MemberFinder.getMember(g, msg.author.id)
		if(!mod) return
		const mention = args.splice(0,1).toString()
		const reason = args.join(' ')  || await l.translate('info.ban.embed.default_reason')
		const member = MemberFinder.getMember(g, mention);
		if(!member){
			msg.react('❌').catch()
			l.reply('errors.invalid_member', mention)
			return
		}
		if(!member.bannable){
			msg.react('❌').catch()
			l.reply('errors.lower_bot')
			return
		}
		await member.ban({deleteMessageSeconds: 18000,reason: reason}).then(async banned => {
			const [r] = await Connections.db.query<RowDataPacket[]>('SELECT warnings, kicks, bans FROM users WHERE id=?', [banned.id])
			const w: number[] = r.map((r)=>r.warnings), k: number[] = r.map((r)=>r.kicks), b: number[] = r.map((r)=>r.bans)
			let warnings = 0, kicks = 0, bans = 0
			if(w.length > 0){
				warnings = w.sort((a,b)=>a - b)[0]
				kicks = k.sort((a,b)=>a - b)[0]
				bans = b.sort((a,b)=>a - b)[0]
			}
			Connections.db.execute('INSERT INTO users values(?, ?, ?, ?, ?, ?)', [banned.id, banned.guild.id, warnings, kicks, bans + 1, reason])
			l.send('info.ban.success',banned.user.tag,g.name)
			if(!msg.client.user) return
			const e = 'info.ban.embed.'
			const embed = new EmbedBuilder()
				.setAuthor({name: await l.translate(e+'title',banned.guild.name), url: msg.client.user.avatarURL() || undefined})
				.setTitle(await l.translate(e+'reason')).setDescription(reason)
				.setFooter({text: await l.translate(e+'footer') + `: ${mod.user.tag}`}).setTimestamp();
			banned.send({embeds: [embed]}).catch(e=>console.error(`No se pudo enviar el mensaje a ${banned.displayName} por ${e}`));
		}).catch(error => {
			l.send('info.ban.error',member.user.tag,error)
			console.error(`Se intentó banear a ${member.displayName} (${member.id}) de ${g.name} (${g.id}) pero falló por ${error.stack}`)
		});
	}
	async checkPermissions(msg: Message,l: Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const mod = MemberFinder.getMember(msg.guild, msg.author.id)
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!mod || !bot) return false
		if (!bot.permissions.has('BanMembers')) {
			l.reply('errors.botperms.ban')
			return false
		}
		if (!mod.permissions.has('BanMembers')) {
			l.reply('errors.modperms.ban')
			return false
		}
		return PermissionsChecker.check(new PermissionsBitField('SendMessages'), msg, l)
	}
	async verify(interaction: ChatInputCommandInteraction<CacheType>, l: InteractionLang): Promise<boolean> {
		if(!interaction.memberPermissions || !interaction.guild) return false
		if(!interaction.memberPermissions.has('BanMembers')){
			l.reply('errors.modperms.ban')
			return false
		}
		const bot = interaction.guild.members.resolve(interaction.applicationId)
		if(!bot) return false
		if(!bot.permissions.has('BanMembers')){
			l.reply('errors.botperms.ban')
			return false
		}
		return true
	}
	static get(): RESTPostAPIApplicationCommandsJSONBody{
		const s = new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a member')
		.addUserOption(option => option.setName('member').setDescription('member banned').setRequired(true))
		.addBooleanOption(option=> option.setName('notify').setDescription('can i send DM to banned user?'))
		.addStringOption(option=> option.setName('reason').setDescription('reason for ban'))
		.addIntegerOption(option=>option.setName('days').setDescription('days of message deleted'))
		return s.toJSON()
	}
	async interact(interaction: ChatInputCommandInteraction<CacheType>, l: InteractionLang): Promise<void> {
		if(!interaction.member || !interaction.guild) return
		const user = interaction.options.getUser('member', true)
		const target = interaction.guild.members.resolve(user)
		if(!target){
			interaction.reply({content: await l.translate('errors.invalid_member', user.tag), ephemeral: true})
			return
		}
		const days = interaction.options.getInteger('days')
		const reason = interaction.options.getString('reason') || await l.translate('info.ban.embed.default_reason')
		const banned = await target.ban({deleteMessageSeconds: days ? days * 3600 * 24 : 3600 * 24,reason: reason})
		const notify = interaction.options.getBoolean('notify')
		if(notify!=false){
			const bot = interaction.client.user
			const mod = <User>interaction.member.user
			this.sendToBanned(banned,reason,bot, mod.tag, l)
		}
		l.reply('info.ban.success',banned.user.tag,interaction.guild.name)
	}
	async sendToBanned(banned: GuildMember, reason: string, client: ClientUser, mod: string, l: InteractionLang): Promise<void>{
		const [r] = await Connections.db.query<RowDataPacket[]>('SELECT warnings, kicks, bans FROM users WHERE id=?', [banned.id])
			const w: number[] = r.map((r)=>r.warnings), k: number[] = r.map((r)=>r.kicks), b: number[] = r.map((r)=>r.bans)
			let warnings = 0, kicks = 0, bans = 0
			if(w.length > 0){
				warnings = w.sort((a,b)=>a - b)[0]
				kicks = k.sort((a,b)=>a - b)[0]
				bans = b.sort((a,b)=>a - b)[0]
			}
			Connections.db.execute('INSERT INTO users values(?, ?, ?, ?, ?, ?)', [banned.id, banned.guild.id, warnings, kicks, bans + 1, reason])
			const e = 'info.ban.embed.'
			const embed = new EmbedBuilder()
				.setAuthor({name: await l.translate(e+'title',banned.guild.name), url: client.avatarURL() || undefined})
				.setTitle(await l.translate(e+'reason')).setDescription(reason)
				.setFooter({text: await l.translate(e+'footer') + `: ${mod}`}).setTimestamp();
			banned.send({embeds: [embed]}).catch(e=>console.error(`No se pudo enviar el mensaje a ${banned.displayName} por ${e}`));
	}
}
