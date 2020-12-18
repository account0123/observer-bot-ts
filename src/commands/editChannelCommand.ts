import { ChannelData, CollectorFilter, DMChannel, GuildChannel, GuildMember, Message, MessageCollector, MessageEmbed, NewsChannel, OverwriteData, PermissionOverwrites, Permissions, PermissionString, Role, TextChannel } from "discord.js";
import { CleanCommand } from ".";
import { ChannelFinder } from "../util/ChannelFinder";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class EditChannelCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['editchannel', 'ec', 'edit channel']
	guildExclusive: boolean = true
	shortdescription: string = 'info.editchannel.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.editchannel.usage'
	examples: string[] = ['lounge', 'lewd-images nsfw:true']
	permission: string = 'MANAGE_CHANNELS'
	channel!: TextChannel
	m!: Message
	lang!: Lang
	private options: ChannelData = {}
	private allowed_roles: string[] = []
	private denied_roles: string[] = []
	private allowed_users: string[] = []
	private denied_users: string[] = []
	private allowed_role_perms = 0
	private denied_role_perms = 0
	private allowed_user_perms = 0
	private denied_user_perms = 0
	permissioncompleted = false
	c: MessageCollector | undefined;
	async run(msg: Message, l: Lang, args: string[], prefix?: string): Promise<void> {
		this.m = msg
		this.lang = l
		const channel = ChannelFinder.getTextChannel(msg, args[0])
		const true_channel = ChannelFinder.getChannel(msg, args[0])
		if(!channel && true_channel){
			msg.channel.send('Comando solo disponible para canales de texto')
			return
		}
		if(!channel){
			l.reply('errors.invalid_channel',args[0])
			return
		}
		this.channel = channel
		switch (args.length) {
			case 1:
				await l.send('info.editchannel.property_question')
				this.askProperty()
				break;
			case 2:
				switch (args[1].toLowerCase().trim()) {
					case 'nombre': case 'name':
						this.askValue('name')
						break;
					case 'nsfw':
						this.askValue('nsfw')
						break;
					case 'posicion': case 'position':
						this.askValue('pos')
						break;
					case 'permisos': case 'permissions': case 'perms':
						this.askValue('perms')
						break;
					default:
						this.lang.send('info.editchannel.property_question')
						break;
				}
			default:
				break;
		}
	}
	private askProperty() {
		const msg = this.m
		const f= (m: Message)=> m.author.id === msg.author.id ? true : false
		let completed = false
		const collector = msg.channel.createMessageCollector(f,{time: 15000})
		collector.on('collect', m => {
			switch (m.toLowerCase().trim()) {
				case 'nombre': case 'name':
					completed = true
					this.askValue('name')
					break;
				case 'posicion': case 'position':
					completed = true
					this.askValue('pos')
					break;
				case 'permisos': case 'permissions': case 'perms':
					completed = true
					this.askValue('perms')
					break;
				default:
					this.lang.send('info.editchannel.property_question')
					break;
			}
		});
		collector.once('end', () => {
			if(!completed) msg.channel.send('Tiempo agotado.')
		});
	}

	private askValue(property: 'name' | 'topic' | 'nsfw' | 'pos' | 'perms'){
		const f = (m: Message)=> m.author.id === this.m.author.id ? true : false
		const time = 120000
		let completed = false
		let collector: MessageCollector
				
		const next = ()=>{
			this.lang.send('info.editchannel.more_options_question')
			completed = false
			const c3 = this.m.channel.createMessageCollector(f, {time: time})
			c3.on('collect', (m: Message)=>{
				const reply = m.content.toLowerCase().trim()
				if(reply === 'yes'){
					m.react('✅')
					completed = true
					collector.emit('end', m)
					this.askProperty()
				}
				if(reply === 'no'){
					m.react('✅')
					completed = true
					collector.emit('end', m)
					this.editChannel()
				}
			});
		}
		switch (property) {
			case 'name':
				this.lang.send('info.editchannel.name_question')
				collector = this.m.channel.createMessageCollector(f,{time: time})
				collector.on('collect', (m: Message)=>{
					if(m.content.length < 2){
						this.lang.send('info.editchannel.short_name')
						return
					}
					if(m.content.length > 100){
						this.lang.send('info.editchannel.long_name')
						return
					}
					this.options.name = m.content.replace(' ','-')
					m.react('✅')
					completed = true
					collector.emit('end', m)
				});
				collector.once('end', ()=>{
					if(!completed) this.m.channel.send('Tiempo agotado')
					else next()
				});
				break;
			case 'topic':
				this.lang.send('info.editchannel.topic_question')
				collector = this.m.channel.createMessageCollector(f,{time: time})
				collector.on('collect', (m: Message)=>{
					if(m.content.length > 1024){
						this.lang.send('info.editchannel.long_topic')
						m.react('❌')
						return
					}
					
					m.react('✅')
					completed = true
					collector.emit('end', m)
				});
				collector.once('end', ()=>{
					if(!completed) this.m.channel.send('Tiempo agotado')
					else next()
				});
				break
			case 'pos':
				this.lang.send('info.editchannel.position_question')
				collector = this.m.channel.createMessageCollector(f,{time: time})
				collector.on('collect', (m: Message)=>{
					const reply = m.content.toLowerCase().trim()
					const n = parseInt(reply, 10)
					if(isNaN(n)){
						m.react('❌')
						this.m.channel.send('Te dejo intertarlo de nuevo, por favor, ingresa un número')
					}else{
						this.options.position = n
						m.react('✅')
						completed = true
						collector.emit('end', m)
					}
				});
				collector.once('end', ()=>{
					if(!completed) this.m.channel.send('Tiempo agotado')
					else next()
				});
				break
			case 'perms':
				this.options.permissionOverwrites = []
				this.lang.send('info.editchannel.permissions_question')
				this.c = this.m.channel.createMessageCollector(f,{time: time})
				this.c.on('collect', (m: Message)=>{
					const reply = m.content.toLowerCase().trim()
					switch(reply){
						case 'allow roles':
							this.askPermissionsTarget('allow', 'role')
							break
						case 'deny roles':
							this.askPermissionsTarget('deny', 'role')
							break
						case 'allow members':
							this.askPermissionsTarget('allow', 'member')
							break
						case 'deny members':
							this.askPermissionsTarget('deny', 'member')
					}
				});
				this.c.once('end', ()=>{
					if(!this.permissioncompleted) this.m.channel.send('Tiempo agotado')
					else next()
				});
		}
	}

	
	askPermissionsTarget(allowOrDeny: 'allow' |'deny', type: 'role' | 'member') {
		let store: string[]
		if(allowOrDeny === 'allow' && type === 'role') store = this.allowed_roles
		if(allowOrDeny === 'allow' && type === 'member') store = this.allowed_users
		if(allowOrDeny === 'deny' && type === 'role') store = this.denied_roles
		if(allowOrDeny === 'deny' && type === 'member') store = this.denied_users
		const f = (m: Message)=> m.author.id === this.m.author.id ? true : false
		const time = 120000
		let completed = false
		let perms_collector: MessageCollector
		perms_collector = this.m.channel.createMessageCollector(f, {time: time})
		perms_collector.on('collect', (r: Message)=>{
			const mentions = r.content.toLowerCase().trim().split('\n')
			if(mentions.length > 1){
				for (const mention of mentions) {
					let object: Role | GuildMember | undefined
					if(type === 'member') object = MemberFinder.getMember(this.m, mention)
					if(type === 'role') object = RoleFinder.getRole(this.m, mention)
					if(!object) this.lang.send('errors.invalid_' + type, mention)
					else store.push(object.id)
				}
				if(this.allowed_roles.length === 0) r.react('❌')
				else{
					completed = true
					perms_collector.emit('end')
				}
			}else{
				let object: Role | GuildMember | undefined
				if(type === 'member') object = MemberFinder.getMember(this.m, mentions[0])
				if(type === 'role') object = RoleFinder.getRole(this.m, mentions[0])
				if(!object) {
					r.react('❌')
					this.lang.send('errors.invalid_' + type, mentions[0])
					this.lang.send('try_again')
					return
				}
				store.push(object.id)
				completed = true
				perms_collector.emit('end')
			}
		});
		perms_collector.once('end', ()=>{
			if(!completed)  this.m.channel.send('Tiempo agotado')
			else{
				this.askPermissions(allowOrDeny, type)
			}
		});
	}

	askPermissions(allowOrDeny: 'allow' | 'deny',  type: 'member' | 'role'){
		const f = (m: Message)=> m.author.id === this.m.author.id ? true : false
		const time = 120000
		let length = 0
		if(allowOrDeny === 'allow' && type === 'role') length = this.allowed_roles.length
		if(allowOrDeny === 'allow' && type === 'member') length = this.allowed_users.length
		if(allowOrDeny === 'deny' && type === 'role') length = this.denied_roles.length
		if(allowOrDeny === 'deny' && type === 'member') length = this.denied_users.length
		this.lang.send('info.editchannel.permissions_list_question', ''+length, type === 'role' ? 'rol(es)' : 'miembro(s)')
		const collector = this.m.channel.createMessageCollector(f, {time: time})
		collector.on('collect', (m: Message)=>{
			const r = m.content.toLowerCase().trim()
			const n = parseInt(r, 10) || parseInt(r, 16)
			if(!isNaN(n)){
				const p = new Permissions(n).bitfield
				if(allowOrDeny === 'allow' && type === 'role') this.allowed_role_perms = p
				if(allowOrDeny === 'deny' && type === 'role') this.denied_role_perms = p
				if(allowOrDeny === 'allow' && type === 'member') this.allowed_user_perms = p
				if(allowOrDeny === 'deny' && type === 'member') this.denied_user_perms = p
				this.permissioncompleted = true
				collector.emit('end')
				if(this.c) this.c.emit('end')
				return
			}
			const sp = r.split('\n')
			const p = new Permissions(0)
			for (const s of sp) {
				for (const f in Permissions.FLAGS) {
					if(s.toUpperCase().trim() === f) p.add(<PermissionString> f)
				}
			}
			if(p.bitfield === 0) m.react('❌')
			else m.react('✅').then(()=>{
				collector.emit('end')
				if(allowOrDeny === 'allow' && type === 'role') this.allowed_role_perms = p.bitfield
				if(allowOrDeny === 'deny' && type === 'role') this.denied_role_perms = p.bitfield
				if(allowOrDeny === 'allow' && type === 'member') this.allowed_user_perms = p.bitfield
				if(allowOrDeny === 'deny' && type === 'member') this.denied_user_perms = p.bitfield
				this.permissioncompleted = true
				if(this.c) this.c.emit('end')
			});
		});
	}

	async editChannel() {
		const uncolide = (object1: PermissionOverwrites, permissions: {allow: number, deny: number})=>{
			const allows = object1.allow.bitfield | permissions.allow
			const denies = object1.deny.bitfield | permissions.deny
			return {id: object1.id, type: object1.type, allow: allows, deny: denies}
		};
		const synthetizePermissions = ()=>{
			const permissions_overwrites: OverwriteData[] = []
			const og_overwrites = this.channel.permissionOverwrites.array()
			for (const og_o of og_overwrites) {
				if(og_o.type === 'role'){
					for (const role of this.allowed_roles) {
						if(og_o.id === role)
							permissions_overwrites.push(uncolide(og_o, {allow: this.allowed_role_perms, deny: 0}))
						else
							permissions_overwrites.push({id: role, allow: this.allowed_role_perms, deny: 0, type: 'role'})
					}
					for (const role of this.denied_roles) {
						if(og_o.id === role)
							permissions_overwrites.push(uncolide(og_o, {allow: 0, deny: this.denied_role_perms}))
						else
							permissions_overwrites.push({id: role, allow: 0, deny: this.denied_role_perms, type: 'role'})
					}
				}
				if(og_o.type === 'member'){
					for (const member of this.allowed_users) {
						if(og_o.id === member) 
							permissions_overwrites.push(uncolide(og_o, {allow: this.allowed_role_perms, deny: 0}))
						else 
							permissions_overwrites.push({id: member, allow: this.allowed_role_perms, deny: 0, type: 'member'})
					}
					for (const member of this.denied_users) {
						if(og_o.id === member)
							permissions_overwrites.push(uncolide(og_o, {allow: 0, deny: this.denied_role_perms}))
						else 
							permissions_overwrites.push({id: member, allow: 0, deny: this.denied_role_perms, type: 'member'})
					}
				}
			}
			return permissions_overwrites
		};

		const data: ChannelData = {
			name: this.options.name || this.channel.name,
			topic: this.options.topic || this.channel.topic || undefined,
			position: this.options.position || this.channel.position,
			permissionOverwrites: synthetizePermissions()
		};

		const no_cat = await this.lang.translate('info.createchannel.embed.no_cat')
		const none = await this.lang.translate('none')
		this.channel.edit(data, await this.lang.translate('reason', this.m.author.tag)).then(async (channel) => {
			const e = 'info.createchannel.embed.'
			const getCategory = ()=>{
				if(channel.parent) return channel.parent.name
				else return no_cat
			};
			const overwrites = channel.permissionOverwrites.array()
			const denyValues = ()=>{
				const denies: string[] = []
				overwrites.forEach(o => {
					let name: Role | GuildMember | undefined
					if(o.type === 'role') name = RoleFinder.getRole(this.m, o.id)
					if(o.type === 'member') name = MemberFinder.getMember(this.m, o.id)
					if(!name) return
					const permission = o.deny.bitfield.toString(16)
					const deny = `${name.toString()}: ${permission}`
					denies.push(deny)
				});
				if(denies.length === 0) return none
				else return denies
			};
			const allowValues = ()=>{
				const allows: string[] = []
				overwrites.forEach(o => {
					let name: Role | GuildMember | undefined
					if(o.type === 'role') name = RoleFinder.getRole(this.m, o.id)
					if(o.type === 'member') name = MemberFinder.getMember(this.m, o.id)
					if(!name) return
					const permission = o.allow.bitfield.toString(16)
					const allow = `${name.toString()}: ${permission}`
					allows.push(allow)
				});
				if(allows.length === 0) return none
				else return allows
			};
			const embed = new MessageEmbed().setTitle(await this.lang.translate(e+'title')).setColor(0)
			.addFields(
				{ name: await this.lang.translate(e+'name'), value: channel.name, inline: true},
				{ name: await this.lang.translate(e+'position'), value: '' + channel.position, inline: true},
				{ name: await this.lang.translate(e+'category'), value: getCategory(), inline: true},
				{ name: await this.lang.translate(e+'allowed'), value: allowValues(), inline: true},
				{ name: await this.lang.translate(e+'denied'), value: denyValues(), inline: true}
			).setTimestamp();
			this.lang.send('info.createchannel.success', channel.toString())
			this.m.channel.send(embed)
			return
		});
	}
	async checkPermissions(msg: Message, l: Lang, prefix?: string): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			l.reply('errors.botperms.create_channel')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			l.reply('errors.modperms.create_channel')
			return false
		}
		return true
	}
	
}