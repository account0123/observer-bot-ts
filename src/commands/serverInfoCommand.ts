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
		const intro = await l.translate(v+'intro')
		const none = await l.translate(v+'none')
		const email = await l.translate(v+'email')
		const fivemin = await l.translate(v+'fivemin')
		const tenmin = await l.translate(v+'tenmin')
		const phone = await l.translate(v+'phone')
		const e = 'info.serverinfo.embed.'
		const mfa = async ()=> this.g.mfaLevel == 1 ? await l.translate('yes'): await l.translate('no')
		if (url) serverEmbed.addField(await l.translate(e+'vanity'),url,true)
		serverEmbed.addFields(
			{ name: await l.translate(e+'name'), value: this.g.name, inline: true},
			{ name: await l.translate(e+'region'), value:this.g.region,inline: true},
			{ name: await l.translate(e+'owner'), value: this.g.owner!.user.tag, inline: true},
			{ name: await l.translate(e+'members'), value: this.countMembers(), inline: true},
			{ name: await l.translate(e+'channels'), value: `${channels} (${channelCount})`,inline: true},
			{ name: await l.translate(e+'emojis'), value: this.g.emojis.cache.size, inline:true},
			{name: await l.translate(e+'safety'), value: intro + (()=>{switch(this.g.verificationLevel){case 'NONE':return none;case 'LOW':return email;case 'MEDIUM':return email+fivemin;case 'HIGH':return email+fivemin+tenmin;case 'VERY_HIGH':return email+fivemin+tenmin+phone}}), inline:true},
			{ name: await l.translate(e+'mfa'), value: await mfa(),inline: true},
			{ name: await  l.translate(e+'boost'), value: this.g.premiumTier,inline: true},
			{ name: await l.translate(e+'created'), value: new Time(this.g.id,l).toString()}
		);
		const d = this.g.description
		if (d) serverEmbed.addField(await l.translate(e+'description'),d)
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
		return `${total} (${members} ${await this.lang.translate('members')}/${bots} bots)`
	}
}