import Command from "./commandInterface";
import { Message, Guild, MessageEmbed } from "discord.js";
import { Time } from "../util/Time";
import { Lang } from "./lang/Lang";

export class ServerInfoCommand implements Command {
	commandNames: string[] = ['server', 'serverinfo', 'si']
	guildExclusive: boolean = true
	shortdescription: string = 'info.serverinfo.description'
	fulldescription: string = 'info.serverinfo.fulldescription'
	g!: Guild;
	lang!: Lang;
	async run(msg: Message, l: Lang): Promise<void> {
		this.g = msg.guild!
		this.lang = l
		const channels = this.g.channels.cache.array().length;
		const channelCount = this.countChannels();
		const serverEmbed = new MessageEmbed()
			.setColor('#D0D0D0')
			.setAuthor(`${this.g.name} (ID: ${this.g.id})`,this.g.iconURL() || undefined);
		const url = this.g.vanityURLCode
		const v = 'info.serverinfo.verification.'
		const intro = l.translate(v+'intro')
		const none = l.translate(v+'none')
		const email = l.translate(v+'email')
		const fivemin = l.translate(v+'fivemin')
		const tenmin = l.translate(v+'tenmin')
		const phone = l.translate(v+'phone')
		const e = 'info.serverinfo.embed.'
		if (url) serverEmbed.addField(l.translate(e+'vanity'),url,true)
		serverEmbed.addFields(
			{name: l.translate(e+'region'), value:this.g.region,inline: true},
			{ name: l.translate(e+'name'), value: this.g.owner!.user.tag, inline: true},
			{ name: l.translate(e+'members'), value: this.countMembers(), inline: true},
			{ name: l.translate(e+'channels'), value: `${channels} (${channelCount})`,inline: true},
			{ name: l.translate(e+'emojis'), value: this.g.emojis.cache.size, inline:true},
			{name: l.translate(e+'safety'), value: intro + (()=>{switch(this.g.verificationLevel){case 'NONE':return none;case 'LOW':return email;case 'MEDIUM':return email+fivemin;case 'HIGH':return email+fivemin+tenmin;case 'VERY_HIGH':return email+fivemin+tenmin+phone}}), inline:true},
			{ name: l.translate(e+'mfa'), value: (()=> this.g.mfaLevel == 1 ? l.translate('yes'): l.translate('no')),inline: true},
			{ name: l.translate(e+'boost'), value: this.g.premiumTier,inline: true},
			{ name: l.translate(e+'created'), value: new Time(this.g.id,l).toString()}
		);
		const d = this.g.description
		if (d) serverEmbed.addField(l.translate(e+'description'),d)
		const icon = this.g.iconURL({dynamic: true})
		if (icon) serverEmbed.setThumbnail(icon)
		const banner = this.g.bannerURL()
		if (banner) serverEmbed.setImage(banner)
		await msg.channel.send(serverEmbed)
	}
	private getChannelsType(type:string):number {
		var count = 0;
		for (const channel of this.g.channels.cache.values()) {
			let channelType = channel.type;
			if (channelType === type) count++;
		}
		return count;
	}
	private countChannels():string {
		const c = 'info.serverinfo.channels.'
		const cat = this.getChannelsType('category');
		const text = this.getChannelsType('text');
		const vc = this.getChannelsType('voice')
		const news = this.getChannelsType('news')
		const store = this.getChannelsType('store')
		let str = '';
		if (cat) str = str.concat(this.lang.translate(c+'categories',''+cat));
		if (text) str = str.concat(this.lang.translate(c+'text',''+text));
		if (vc) str = str.concat(this.lang.translate(c+'voice',''+vc));
		if (news) str = str.concat(this.lang.translate(c+'news',''+news));
		if (store) str = str.concat(this.lang.translate(c+'store',''+store));
		return str;
	}
	private countMembers():string{
		var members = 0
		var bots = 0
		const total = this.g.memberCount
		this.g.members.cache.each(m=>{if(m.user.bot) bots++;else members++;});
		return `${total} (${members} ${this.lang.translate('members')}/${bots} bots)`
	}
}