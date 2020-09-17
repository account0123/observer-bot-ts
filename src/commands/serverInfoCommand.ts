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
		const channelsArray = this.g.channels.cache.array().length;
		const channelCount = this.countChannels();
		const serverEmbed = new MessageEmbed()
			.setColor('#D0D0D0')
			.setAuthor(this.g.name,this.g.iconURL() || undefined);
		const url = this.g.vanityURLCode
		const v = 'info.serverinfo.verification.'
		const [intro, none, email, fivemin, tenmin, phone] = await Promise.all([
			l.translate(v+'intro'), l.translate(v+'none'), l.translate(v+'email'),
			l.translate(v+'fivemin'), l.translate(v+'tenmin'), l.translate(v+'phone')
		]);
		const [yes, no] = await Promise.all([l.translate('yes'), l.translate('no')])
		const e = 'info.serverinfo.embed.'
		const hasMfa = ()=> this.g.mfaLevel == 1 ? yes : no
		const buildSafety = ()=>{switch(this.g.verificationLevel){case 'NONE':return none;case 'LOW':return email;case 'MEDIUM':return email+fivemin;case 'HIGH':return email+fivemin+tenmin;case 'VERY_HIGH':return email+fivemin+tenmin+phone}};
		const [vanity, region, owner, members, channels, emojis, safety, mfa, boost, created, description] = 
		await Promise.all([
			l.translate(e+'vanity'), l.translate(e+'region'), l.translate(e+'owner'), l.translate(e+'members'),
			l.translate(e+'channels'), l.translate(e+'emojis'), l.translate(e+'safety'), l.translate(e+'mfa'),
			l.translate(e+'boost'), l.translate(e+'created'), l.translate(e+'description')
		]);
		if (url) serverEmbed.addField(vanity,url,true)
		serverEmbed.addFields(
			{ name: 'ID', value: this.g.id, inline: true},
			{ name: region, value:this.g.region,inline: true},
			{ name: owner, value: this.g.owner!.toString(), inline: true},
			{ name: members, value: await this.countMembers(), inline: true},
			{ name: channels, value: `${channelsArray} (${await channelCount})`,inline: true},
			{ name: emojis, value: this.g.emojis.cache.size, inline:true},
			{ name: safety, value: intro + buildSafety(), inline:true},
			{ name: mfa, value: hasMfa(),inline: true},
			{ name: boost, value: this.g.premiumTier,inline: true},
			{ name: created, value: new Time(this.g.id,l).toString()}
		);
		const d = this.g.description
		if (d) serverEmbed.addField(description,d)
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
	private async countMembers():Promise<string>{
		var members = 0
		var bots = 0
		const total = this.g.memberCount
		this.g.members.cache.each(m=>{if(m.user.bot) bots++;else members++;});
		return `${total} (${members} ${await this.lang.translate('members')}/${bots} bot(s))`
	}
}