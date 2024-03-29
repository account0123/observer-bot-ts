import Command from "./commandInterface";
import { Message, Guild, EmbedBuilder, GuildMFALevel, ChannelType } from "discord.js";
import { Time } from "../util/Time";
import { Lang } from "./lang/Lang";

export class ServerInfoCommand implements Command {
	commandNames: string[] = ['server', 'serverinfo', 'si']
	guildExclusive = true
	shortdescription = 'info.serverinfo.description'
	fulldescription = 'info.serverinfo.fulldescription'
	type = 'info'
	g!: Guild;
	lang!: Lang;
	async run(msg: Message, l: Lang): Promise<void> {
		if(msg.guild) this.g = msg.guild
		this.lang = l
		const channels = this.g.channels.cache.size
		const channelCount = this.countChannels();
		const serverEmbed = new EmbedBuilder()
			.setColor('#D0D0D0')
			.setAuthor({name: this.g.name, url: this.g.iconURL() || undefined})
		const v = 'info.serverinfo.verification.'
		const intro = await l.translate(v+'intro')
		const none = await l.translate(v+'none')
		const email = await l.translate(v+'email')
		const fivemin = await l.translate(v+'fivemin')
		const tenmin = await l.translate(v+'tenmin')
		const phone = await l.translate(v+'phone')
		const e = 'info.serverinfo.embed.'
		const [mfa, partnered, verified] = await Promise.all([l.translate(e+'mfa'), l.translate(e+'partnered'), l.translate(e+'verified')])
		const features: string[] = []
		if(this.g.mfaLevel == GuildMFALevel.Elevated) features.push(mfa)
		if(this.g.partnered) features.push(partnered)
		if(this.g.verified) features.push(verified)
		const buildSafety = ()=>{switch(this.g.verificationLevel){case 0:return none;case 1:return email;case 2:return email+fivemin;case 3:return email+fivemin+tenmin;case 4:return email+fivemin+tenmin+phone}};
		const boosts = this.g.premiumSubscriptionCount
		let tier = "Nivel 0"
		switch (this.g.premiumTier) {
			case 0:
				tier = "Nivel 0"
				break;
			case 1:
				tier = "Nivel 1"
				break
			case 2:
				tier = "Nivel 2"
				break
			case 3:
				tier = "Nivel 3"
		}
		const owner = this.g.members.resolve(this.g.ownerId)

		serverEmbed.addFields([
			{ name: 'ID', value: this.g.id, inline: true},
			{ name: await l.translate(e+'owner'), value: owner ? owner.user.tag : '*not found*', inline: true},
			{ name: await l.translate(e+'members'), value: String(this.g.memberCount), inline: true},
			{ name: await l.translate(e+'channels'), value: `${channels} (${await channelCount})`,inline: true},
			{ name: await l.translate(e+'emojis'), value: String(this.g.emojis.cache.size), inline:true},
			{ name: await l.translate(e+'safety'), value: intro + buildSafety(), inline:true},
			{ name: await l.translate(e+'boost'), value: `${tier} (${boosts} boosts)`,inline: true},
			{ name: await l.translate(e+'created'), value: new Time(this.g.id,l).toString()}
		]);
		const d = this.g.description
		if (d) serverEmbed.addFields([{name: await l.translate(e+'description'), value: d}])
		const icon = this.g.iconURL()
		if(icon) serverEmbed.setThumbnail(icon)
		const banner = this.g.bannerURL()
		if(banner) serverEmbed.setImage(banner)
		else if(this.g.discoverySplash) serverEmbed.setImage(this.g.discoverySplashURL() || '')
		const vanity = this.g.vanityURLCode
		if(vanity) serverEmbed.addFields([{name: await l.translate(e+'vanity'), value: `${vanity} (used ${this.g.vanityURLUses} times)`, inline: true}])
		if(features.length > 0) serverEmbed.addFields([{name: await l.translate(e+'features'), value: '-' + features.join('\n-'), inline: true}])

		msg.channel.send({embeds: [serverEmbed]})
	}
	private getChannelsType(type:ChannelType):number {
		let count = 0;
		for (const channel of this.g.channels.cache.values()) {
			const channelType = channel.type;
			if(channelType == type) count++;
		}
		return count;
	}
	private async countChannels():Promise<string> {
		const c = 'info.serverinfo.channels.'
		const cat = this.getChannelsType(ChannelType.GuildCategory);
		const text = this.getChannelsType(ChannelType.GuildText);
		const vc = this.getChannelsType(ChannelType.GuildVoice)
		const news = this.getChannelsType(ChannelType.GuildAnnouncement)
		const stage = this.getChannelsType(ChannelType.GuildStageVoice)
		const forum = this.getChannelsType(ChannelType.GuildForum)
		let str = '';
		if(cat) str = str.concat(await this.lang.translate(c+'categories',''+cat));
		if(text) str = str.concat(await this.lang.translate(c+'text',''+text));
		if(vc) str = str.concat(await this.lang.translate(c+'voice',''+vc));
		if(news) str = str.concat(await this.lang.translate(c+'news',''+news));
		if(stage) str = str.concat(await this.lang.translate(c+'stage',''+stage));
		if(forum) str = str.concat(await this.lang.translate(c+'forum'), ''+forum)
		return str;
	}
}