import { Message, GuildChannelCreateOptions, ChannelType, OverwriteType, CacheType, CommandInteraction, GuildChannel, EmbedBuilder, Role, GuildMember, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder, ChatInputCommandInteraction} from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import { InteractionLang, Lang } from "./lang/Lang";
import SlashCommand from "./slashCommandInterface";

export class CreateChannelCommand implements SlashCommand{
	permission = 'MANAGE_CHANNELS'
	shortdescription = 'info.createchannel.description'
	fulldescription = 'info.createchannel.fulldescription';
	commandNames: string[] = ['createchannel', 'cc']
	requiredArgs = 2
	examples: string[] = ['text gaming-chat {topic:Channel for all gamers}', 'text booster-channel allow-roles [server booster:{view_channel}] deny-role [everyone:{view_channel}]', 'text John\'s-channel allow-user [John:{send_messages,manage_channel,manage_webhooks}] deny-role {everyone:send_messages}', 'text hentai {nsfw}','category bots {position:4}']
	usage = 'info.createchannel.usage'
	guildExclusive = true
	type = 'manage'
	async run(msg: Message): Promise<void> {
		msg.channel.send("This command is only available as (/) slash command")
	}

	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.client.user || !msg.guild) return false
		const mod = MemberFinder.getMember(msg.guild, msg.author.id)
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!mod || !bot) return false
		if (!bot.permissions.has('ManageChannels')) {
			l.reply('errors.botperms.create_channel')
			return false
		}
		if (!mod.permissions.has('ManageChannels')) {
			l.reply('errors.modperms.create_channel')
			return false
		}
		return true
	}
	async verify(interaction: CommandInteraction<CacheType>): Promise<boolean> {
		if(!interaction.memberPermissions || !interaction.guild) return false
		if(!interaction.memberPermissions.has('ManageChannels')){
			interaction.reply({content: 'Mod no permission'})
			return false
		}
		const bot = interaction.guild.members.resolve(interaction.applicationId)
		if(!bot) return false
		if(!bot.permissions.has('ManageChannels')){
			interaction.reply({content: 'Bot no permission'})
			return false
		}
		return true
	}
	async interact(interaction: ChatInputCommandInteraction, l: InteractionLang): Promise<void>{
		if(!interaction.member) return
		if(!interaction.guild){
			interaction.reply({content: await l.translate('errors.no_dms'), ephemeral: true})
			return
		}
		const opt = interaction.options
		let parent
		const parentOpt = opt.getChannel('category', false)
		if(parentOpt) parent = parentOpt.type == ChannelType.GuildCategory ? parentOpt.id : null
		const data: GuildChannelCreateOptions = {
			name: opt.getString('name', true),
			topic: opt.getString('topic') || undefined,
			position: opt.getInteger('position') || undefined,
			parent,
			type: opt.getInteger('type') || ChannelType.GuildText
		}
		interaction.guild.channels.create(data).then((channel)=>{
			this.sendResponse(channel, l, interaction)
		});
	}
	static get(): RESTPostAPIApplicationCommandsJSONBody{
		const choices: {name: string, value: number}[] = [
			{name: 'Text', value: ChannelType.GuildText},
			{name: 'Voice', value: ChannelType.GuildVoice},
			{name: 'Stage', value: ChannelType.GuildStageVoice},
			{name: 'Announcement', value: ChannelType.GuildAnnouncement}
		]
		const s = new SlashCommandBuilder()
			.setName('createchannel')
			.setDescription('Creates a channel easily')
			.addStringOption(option=>option.setName('name').setDescription('name of the channel').setRequired(true).setMinLength(1).setMaxLength(100))
			.addIntegerOption(option=>option.setName('type').setDescription('type of channel').setAutocomplete(true).addChoices(...choices).setRequired(false))
			.addStringOption(option=>option.setName('topic').setDescription('topic of the channel').setRequired(false).setMaxLength(1024))
			.addIntegerOption(option=>option.setName('position').setDescription('position of the channel').setMinValue(0))
			.addChannelOption(option=>option.setName('category').setDescription('what category channel fits in').setRequired(false).addChannelTypes(ChannelType.GuildCategory))
		return s.toJSON()
	}
	async sendResponse(channel: GuildChannel, l: InteractionLang, i: CommandInteraction): Promise<void> {
		const no_cat = await l.translate('info.createchannel.embed.no_cat')
		const none = await l.translate('none')
		const e = 'info.createchannel.embed.'
		const getCategory = ()=>channel.parent ? channel.parent.name : no_cat
		const overwrites = channel.permissionOverwrites.cache
		const denyValues = ()=>{
			const denies: string[] = []
			overwrites.forEach(o => {
				let obj: Role | GuildMember | undefined
				if(o.type == OverwriteType.Role) obj = RoleFinder.getRole(channel.guild, o.id)
				if(o.type === OverwriteType.Member) obj = MemberFinder.getMember(channel.guild, o.id)
				if(!obj) return
				const permission = o.deny.bitfield.toString(16)
				const deny = `${obj.toString()}: #${permission}`
				denies.push(deny)
			});
			if(denies.length === 0) return none
			else return denies.join('\n')
		};
		const allowValues = ()=>{
			const allows: string[] = []
			overwrites.forEach(o => {
				let obj: Role | GuildMember | undefined
				if(o.type == OverwriteType.Role) obj = RoleFinder.getRole(channel.guild, o.id)
				if(o.type === OverwriteType.Member) obj = MemberFinder.getMember(channel.guild, o.id)
				if(!obj) return
				const permission = o.allow.bitfield.toString(16)
				const allow = `${obj.toString()}: #${permission}`
				allows.push(allow)
			});
			if(allows.length === 0) return none
			else return allows.join('\n')
		};
		const embed = new EmbedBuilder().setTitle(await l.translate(e+'title')).setColor(0)
			.addFields([
					{ name: await l.translate(e+'name'), value: channel.name, inline: true},
					{ name: await l.translate(e+'position'), value: `${channel.position}`, inline: true},
					{ name: await l.translate(e+'category'), value: getCategory(), inline: true},
					{ name: await l.translate(e+'allowed'), value: allowValues(), inline: true},
					{ name: await l.translate(e+'denied'), value: denyValues(), inline: true}
				]).setTimestamp()
		const text = await l.translate('info.createchannel.success', channel.toString())
		i.reply({content: text,embeds: [embed], ephemeral: true})
	}
}