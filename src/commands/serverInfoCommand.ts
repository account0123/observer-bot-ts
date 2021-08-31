import Command from "./commandInterface";
import { Message, Guild, MessageEmbed } from "discord.js";
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
		const channels = this.g.channels.cache.array().length;
		const channelCount = this.countChannels();
		const serverEmbed = new MessageEmbed()
			.setColor('#D0D0D0')
			.setAuthor(this.g.name,this.g.iconURL() || undefined);
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
		if(this.g.mfaLevel == 1) features.push(mfa)
		if(this.g.partnered) features.push(partnered)
		if(this.g.verified) features.push(verified)
		const buildSafety = ()=>{switch(this.g.verificationLevel){case 'NONE':return none;case 'LOW':return email;case 'MEDIUM':return email+fivemin;case 'HIGH':return email+fivemin+tenmin;case 'VERY_HIGH':return email+fivemin+tenmin+phone}};
		const boosts = this.g.premiumSubscriptionCount
		const o = this.g.owner ? this.g.owner.user.tag : '' 
		serverEmbed.addFields(
			{ name: 'ID', value: this.g.id, inline: true},
			{ name: await l.translate(e+'region'), value:this.g.region,inline: true},
			{ name: await l.translate(e+'owner'), value: o, inline: true},
			{ name: await l.translate(e+'members'), value: this.g.memberCount, inline: true},
			{ name: await l.translate(e+'channels'), value: `${channels} (${await channelCount})`,inline: true},
			{ name: await l.translate(e+'emojis'), value: this.g.emojis.cache.size, inline:true},
			{ name: await l.translate(e+'safety'), value: intro + buildSafety(), inline:true},
			{ name: await l.translate(e+'boost'), value: `${this.g.premiumTier} (${boosts} boosts)`,inline: true},
			{ name: await l.translate(e+'created'), value: new Time(this.g.id,l).toString()}
		);
		const d = this.g.description
		if (d) serverEmbed.addField(await l.translate(e+'description'),d)
		const icon = this.g.iconURL({dynamic: true})
		if (icon) serverEmbed.setThumbnail(icon)
		const banner = this.g.bannerURL()
		if (banner) serverEmbed.setImage(banner)
		else if(this.g.discoverySplash) serverEmbed.setImage(this.g.discoverySplashURL() || '')
		const vanity = this.g.vanityURLCode
		if(vanity) serverEmbed.addField(await l.translate(e+'vanity'), `${vanity} (used ${this.g.vanityURLUses} times)`, true)
		if(features.length > 0) serverEmbed.addField(await l.translate(e+'features'), '-' + features.join('\n-'), true)

		msg.channel.send(serverEmbed)
	}
	private getChannelsType(type:string):number {
		let count = 0;
		for (const channel of this.g.channels.cache.values()) {
			const channelType = channel.type;
			if (channelType === type) count++;
		}
		return count;
	}
	private async countChannels():Promise<string> {
		const c = 'info.serverinfo.channels.'
		const cat = this.getChannelsType('category');
		const text = this.getChannelsType('text');
		const vc = this.getChannelsType('voice')
		const news = this.getChannelsType('news')
		const store = this.getChannelsType('store')
		let str = '';
		if (cat) str = str.concat(await this.lang.translate(c+'categories',''+cat));
		if (text) str = str.concat(await this.lang.translate(c+'text',''+text));
		if (vc) str = str.concat(await this.lang.translate(c+'voice',''+vc));
		if (news) str = str.concat(await this.lang.translate(c+'news',''+news));
		if (store) str = str.concat(await this.lang.translate(c+'store',''+store));
		return str;
	}
}