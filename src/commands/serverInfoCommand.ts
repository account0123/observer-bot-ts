import Command from "./commandInterface";
import { Message, Guild, MessageEmbed } from "discord.js";
import { Time } from "../util/Time";

export class ServerInfoCommand implements Command {
	commandNames: string[] = ['server', 'serverinfo', 'si']
	guildExclusive: boolean = true
	shortdescription: string = 'info.serverinfo.description'
	fulldescription: string = 'info.serverinfo.fulldescriptions'
	g!: Guild;
	async run(msg: Message): Promise<void> {
		this.g = msg.guild!
		const channels = this.g.channels.cache.array().length;
		const channelCount = this.countChannels();
		const serverEmbed = new MessageEmbed()
			.setColor('#D0D0D0')
			.setAuthor(`${this.g.name} (ID: ${this.g.id})`,this.g.iconURL() || undefined);
		const url = this.g.vanityURLCode
		const intro = 'Cada usuario debe:\n'
		const none = 'Divertirse, todos son bienvenidos'
		const email = '1. Tener correo vertificado'
		const fivemin = '\n2. Estar 5 minutos registrado'
		const tenmin = '\n3. Estar 10 minutos en el servidor'
		const phone = '\n4. Tener el número verificado'
		if (url) serverEmbed.addField('Invitación oficial',url,true)
		serverEmbed.addFields(
			{name: 'Región', value:this.g.region,inline: true},
			{ name: 'Dueño'    , value: this.g.owner!.user.tag, inline: true},
			{ name: 'Miembros' , value: this.g.memberCount, inline: true},
			{ name: 'Canales'  , value: `${channels} (${channelCount})`,inline: true},
			{ name: 'Emojis', value: this.g.emojis.cache.size, inline:true},
			{name: 'Nivel de seguridad', value: intro + (()=>{switch(this.g.verificationLevel){case 'NONE':return none;case 'LOW':return email;case 'MEDIUM':return email+fivemin;case 'HIGH':return email+fivemin+tenmin;case 'VERY_HIGH':return email+fivemin+tenmin+phone}}), inline:true},
			{ name: 'Factor de seguridada activado?', value: (()=> this.g.mfaLevel == 1 ? 'Sí' : 'No'),inline: true},
			{name: 'Nivel de boost', value: this.g.premiumTier,inline: true},
			{ name: 'Creado el', value: new Time(this.g.id).toString()}
		);
		const d = this.g.description
		if (d) serverEmbed.addField('Descripción',d)
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
	private countChannels() {
		const cat = this.getChannelsType('category');
		const text = this.getChannelsType('text');
		const vc = this.getChannelsType('voice')
		const news = this.getChannelsType('news')
		const store = this.getChannelsType('store')
		let str = '';
		if (cat) str = str.concat(`${cat} categorías`);
		if (text) str = str.concat(`/${text} de texto`);
		if (vc) str = str.concat(`/${vc} de voz`);
		if (news) str = str.concat(`${news} de anuncios`);
		if (store) str = str.concat(`/${store} de tienda`);
		return str;
	}
}