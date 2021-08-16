import { Message, Permissions, MessageEmbed, GuildCreateChannelOptions, PermissionString, OverwriteData, Guild, CategoryChannel, GuildMember, Role } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class CreateChannelCommand implements ArgCommand{
	permission = 'MANAGE_CHANNELS'
	shortdescription = 'info.createchannel.description'
	fulldescription = 'info.createchannel.fulldescription';
	commandNames: string[] = ['createchannel', 'cc']
	requiredArgs = 2
	examples: string[] = ['text gaming-chat {topic:Channel for all gamers}', 'text booster-channel allow-roles [server booster:{view_channel}] deny-role [everyone:{view_channel}]', 'text John\'s-channel allow-user [John:{send_messages,manage_channel,manage_webhooks}] deny-role {everyone:send_messages}', 'text hentai {nsfw}','category bots {position:4}']
	usage = 'info.createchannel.usage'
	guildExclusive = true
	type = 'manage'
	channel_type!: GuildCreateChannelOptions["type"]
	lang!: Lang;
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		this.lang = l
		const first_arg = (args.shift() || '').toLowerCase()
		switch (first_arg) {
			case 'text': case 'voice': case 'news': case 'store': case 'category':
				this.channel_type = first_arg
				break;
			default:
				l.send('errors.invalid_type',first_arg)
				return
		}
		const name = args.shift()
		if(!name){
			msg.react('❌')
			return
		}
		const arg = args.join(' ')
		const no_cat = await l.translate('info.createchannel.embed.no_cat')
		const none = await l.translate('none')
		let data: GuildCreateChannelOptions | undefined
		const g = msg.guild
		if(!g) return
		if(arg) data = this.createData(msg, arg)
		if (!data) {
			g.channels.create(name, {type: this.channel_type}).then(async (channel) => {
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
						if(o.type === 'role') name = RoleFinder.getRole(msg, o.id)
						if(o.type === 'member') name = MemberFinder.getMember(msg, o.id)
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
						if(o.type === 'role') name = RoleFinder.getRole(msg, o.id)
						if(o.type === 'member') name = MemberFinder.getMember(msg, o.id)
						if(!name) return
						const permission = o.allow.bitfield.toString(16)
						const allow = `${name.toString()}: ${permission}`
						allows.push(allow)
					});
					if(allows.length === 0) return none
					else return allows
				};			
				const embed = new MessageEmbed().setTitle(await l.translate(e+'title')).setColor(0)
				.addFields(
					{ name: await l.translate(e+'name'), value: channel.name, inline: true},
					{ name: await l.translate(e+'position'), value: channel.position, inline: true},
					{ name: await l.translate(e+'category'), value: getCategory(), inline: true},
					{ name: await l.translate(e+'allowed'), value: allowValues(), inline: true},
					{ name: await l.translate(e+'denied'), value: denyValues(), inline: true}
				).setTimestamp();
				l.send('info.createchannel.success',channel.toString())
				msg.channel.send(embed)
				return
			}).catch( (error) => {
				if(error.code === 30013) l.send('info.createchannel.30013')
				else l.reply('errors.unknown')
				console.error(error)
			});
			return
		}
		// Ejecución
		data.type = this.channel_type
		g.channels.create(name,data).then(async (channel) => {
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
					if(o.type === 'role') name = RoleFinder.getRole(msg, o.id)
					if(o.type === 'member') name = MemberFinder.getMember(msg, o.id)
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
					if(o.type === 'role') name = RoleFinder.getRole(msg, o.id)
					if(o.type === 'member') name = MemberFinder.getMember(msg, o.id)
					if(!name) return
					const permission = o.allow.bitfield.toString(16)
					const allow = `${name.toString()}: ${permission}`
					allows.push(allow)
				});
				if(allows.length === 0) return none
				else return allows
			};
			const embed = new MessageEmbed().setTitle(await l.translate(e+'title')).setColor(0)
			.addFields(
				{ name: await l.translate(e+'name'), value: channel.name, inline: true},
				{ name: await l.translate(e+'position'), value: '' + channel.position, inline: true},
				{ name: await l.translate(e+'category'), value: getCategory(), inline: true},
				{ name: await l.translate(e+'allowed'), value: allowValues(), inline: true},
				{ name: await l.translate(e+'denied'), value: denyValues(), inline: true}
			).setTimestamp();
			l.send('info.createchannel.success', channel.toString())
			msg.channel.send(embed)
			return
		}).catch( (error) => {
			if(error.code === 30013) l.send('info.createchannel.30013')
			else l.reply('errors.unknown')
			console.error(error)
		});
	}
	createData(msg: Message,str:string): GuildCreateChannelOptions | undefined {
		if(str === '') return undefined
		// {topic:something}
		const properties_match = str.match(/topic:[\w\s]+|position:\s*\d+|nsfw/gm)
		const properties = new Map<string, string>()
		if (properties_match !== null) {
			properties_match.forEach(match => {
				const splits = match.trim().split(':')
				const key = splits[0].trim()
				if(key == 'nsfw') splits[1] = 'true'
				if (splits.length != 2) return
				properties.set(key,splits[1].trim())
			});
		}
		const properties_regex = /\{[\w\s:,]+\},?/g
		const allowed_roles_match = str.match(/allow-roles \[([^,\]]+)\]/)
		const allowed_roles = new Map<string,PermissionString[]>()
		if (allowed_roles_match !== null) {
			allowed_roles_match.forEach(match => {
				const properties_match = properties_regex.exec(match)
				if(properties_match !== null) {
				// rol1:{permiso1,permiso2}
				// rol2:{permiso1,permiso2,permiso3}
				properties_match.forEach(overwrite_object => {
					const overwrite_split = overwrite_object.split(':')
					if(overwrite_split.length != 2) return
					const key = overwrite_split[0]
					const role = RoleFinder.getRole(msg, key)
					if(!role){
						this.lang.reply('errors.invalid_role', key)
						return
					}
					const v = overwrite_split[1]
					if(!v.startsWith('{') || !v.endsWith('}')) return
					const values = v.slice(1,-1).split(',').map(s=>s.toUpperCase()).filter(s=>{
						const isPermission = Object.keys(Permissions.FLAGS).includes(s)
						if(!isPermission){
							msg.reply('Value ' + s + 'is not a valid permission name')
							return false
						}else return true
					});
					if(values.length < 1) return
					allowed_roles.set(role.id, <PermissionString[]> values)
				});
				}
			});
		}
		const denied_roles_match = str.match(/deny-roles \[([^,\]]+)\]/)
		const denied_roles = new Map<string,PermissionString[]>()
		if (denied_roles_match !== null) {
			denied_roles_match.forEach(match => {
				const properties_match = properties_regex.exec(match)
				if(properties_match !== null) {
				// The result can be accessed through the `m`-variable.
				properties_match.forEach(overwrite_object => {
					const overwrite_split = overwrite_object.split(':')
					if(overwrite_split.length != 2) return
					const key = overwrite_split[0]
					const role = RoleFinder.getRole(msg, key)
					if(!role){
						this.lang.reply('errors.invalid_role', key)
						return
					}
					const v = overwrite_split[1]
					if(!v.startsWith('{') || !v.endsWith('}')) return
					const values = v.slice(1,-1).split(',').map(s=>s.toUpperCase()).filter(s=>{
						const isPermission = Object.keys(Permissions.FLAGS).includes(s)
						if(!isPermission){
							msg.reply('Value ' + s + 'is not a valid permission name')
							return false
						}else return true
					});
					if(values.length < 1) return
					denied_roles.set(role.id, <PermissionString[]> values)
				});
				}
			});
		}
		const allowed_users_match = str.match(/allow-users \[([^,\]]+)\]/)
		const allowed_users = new Map<string,PermissionString[]>()
		if (allowed_users_match !== null) {
			allowed_users_match.forEach(match => {
				const properties_match = properties_regex.exec(match)
				if(properties_match !== null) {
				// The result can be accessed through the `m`-variable.
				properties_match.forEach(overwrite_object => {
					const overwrite_split = overwrite_object.split(':')
					if(overwrite_split.length != 2) return
					const key = overwrite_split[0]
					const member = MemberFinder.getMember(msg, key)
					if(!member){
						this.lang.reply('errors.invalid_role', key)
						return
					}
					const v = overwrite_split[1]
					if(!v.startsWith('{') || !v.endsWith('}')) return
					const values = v.slice(1,-1).split(',').map(s=>s.toUpperCase()).filter(s=>{
						const isPermission = Object.keys(Permissions.FLAGS).includes(s)
						if(!isPermission){
							msg.reply('Value ' + s + 'is not a valid permission name')
							return false
						}else return true
					});
					if(values.length < 1) return
					allowed_users.set(member.id, <PermissionString[]> values)
				});
				}
			});
		}
		const denied_users_match = str.match(/allow-users \[([^,\]]+)\]/)
		const denied_users = new Map<string,PermissionString[]>()
		if (denied_users_match !== null) {
			denied_users_match.forEach(match => {
				const properties_match = properties_regex.exec(match)
				if(properties_match !== null) {
				// The result can be accessed through the `m`-variable.
				properties_match.forEach(overwrite_object => {
					const overwrite_split = overwrite_object.split(':')
					if(overwrite_split.length != 2) return
					const key = overwrite_split[0]
					const member = MemberFinder.getMember(msg, key)
					if(!member){
						this.lang.reply('errors.invalid_role', key)
						return
					}
					const v = overwrite_split[1]
					if(!v.startsWith('{') || !v.endsWith('}')) return
					const values = v.slice(1,-1).split(',').map(s=>s.toUpperCase()).filter(s=>{
						const isPermission = Object.keys(Permissions.FLAGS).includes(s)
						if(!isPermission){
							msg.reply('Value ' + s + 'is not a valid permission name')
							return false
						}else return true
					});
					if(values.length < 1) return
					denied_users.set(member.id, <PermissionString[]> values)
				});
				}
			});
		}
		// Default Values
		const data: GuildCreateChannelOptions = {
			topic: '',
			position: 0,
			nsfw: false,
			parent: undefined,
			permissionOverwrites: undefined
		};
		const g = msg.guild
		if(!g) return
		// Setting values
		for (const [key,value] of properties) {
			switch (key.toLowerCase()) {
				case 'position': case 'pos':
			data.position = parseInt(value)
			if (isNaN(data.position)) {
				console.error('valor position (' + value + ') no es un número')
				data.position = 0
			}
			if(this.channel_type !== 'category') data.parent = setParent(data.position, g)
			break
				case 'topic': data.topic = value
				break
				case 'nsfw': if(value == 'true') data.nsfw =true
			} 
		}
		const permissionOverwrites: OverwriteData[] = []
		for (const [key, value] of allowed_roles) {
			const permissions = new Permissions(value)
			const overwrite: OverwriteData = {id: key, allow: permissions, type: 'role'};
			permissionOverwrites.push(overwrite)
		}
		for (const [key, value] of denied_roles) {
			const permissions = new Permissions(value)
			const overwrite: OverwriteData = {id: key, deny: permissions, type: 'role'};
			permissionOverwrites.push(overwrite)
		}
		for (const [key, value] of allowed_users) {
			const permissions = new Permissions(value)
			const overwrite: OverwriteData = {id: key, allow: permissions, type: 'member'};
			permissionOverwrites.push(overwrite)
		}
		for (const [key, value] of denied_users) {
			const permissions = new Permissions(value)
			const overwrite: OverwriteData = {id: key, deny: permissions, type: 'member'};
			permissionOverwrites.push(overwrite)
		}
		data.permissionOverwrites = permissionOverwrites
		return data
	}

	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const mod = msg.guild.member(msg.author)
		const bot = msg.guild.member(msg.client.user)
		if(!mod || !bot) return false
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

function setParent(position: number, guild: Guild){
	if(position === 0) return undefined
	for (const channel of guild.channels.cache.values()) {
		if(channel.type === 'category'){
			const category = <CategoryChannel> channel
			console.log(category.name)
			// Verificar que position sea menor a la cantidad de canales de la categoría
			const channels = category.children.size
			if(position <= channels) return category.id
			else channels
		}
	}
	const lastCategory = guild.channels.cache.filter(channel=>{if(channel.type === 'category') return true;else return false;}).last()
	if(lastCategory) return lastCategory.id
	else return undefined
}