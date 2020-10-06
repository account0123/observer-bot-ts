import { Message, Permissions, MessageEmbed, GuildCreateChannelOptions, PermissionString, OverwriteData, Guild, CategoryChannel } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class CreateChannelCommand implements ArgCommand{
	permission: string = 'MANAGE_CHANNELS'
	shortdescription: string = 'info.createchannel.description'
	fulldescription: string = 'info.createchannel.fulldescription';
	commandNames: string[] = ['createchannel', 'cc']
	requiredArgs: number = 2
	examples: string[] = ['text gaming-chat {topic:Channel for all gamers}', 'text booster-channel allow-role {server booster:view_channel} deny-role {everyone:view_channel}', 'text John\'s-channel allow-user {John:{send_messages,manage_channel,manage_webhooks}} deny-role {everyone:send_messages}', 'text hentai {nsfw}','category bots {position:4}']
	usage:string = 'info.createchannel.usage'
	guildExclusive: boolean = true
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		// nuevo código
		const first_arg = args.shift()!.toLowerCase()
		let type: GuildCreateChannelOptions["type"]
		switch (first_arg) {
			case 'text': case 'voice': case 'news': case 'store': case 'category':
				type = first_arg
				break;
			default:
				l.send('errors.invalid_type',first_arg)
				return
		}
		const name = args.shift()!
		const arg = args.join(' ')
		const no_cat = await l.translate('info.createchannel.embed.no_cat')
		let data: GuildCreateChannelOptions | undefined
		if(arg) data = createData(msg, arg)
		if (!data) {
			msg.guild!.channels.create(name, {type: type}).then(async (channel) => {
				const e = 'info.createchannel.embed.'
				const getCategory = ()=>{
					if(channel.parent) return channel.parent.name
					else return no_cat
				};
				const embed = new MessageEmbed().setTitle(l.translate(e+'title')).setColor(0)
				.addFields(
					{ name: await l.translate(e+'name'), value: channel.name, inline: true},
					{ name: await l.translate(e+'position'), value: '' + channel.calculatedPosition, inline: true},
					{ name: await l.translate(e+'category'), value: getCategory(), inline: true},
					{ name: await l.translate(e+'allowed'), value: channel.permissionOverwrites.mapValues((o)=>o.allow.bitfield.toString(16)).array().toString(), inline: true},
					{ name: await l.translate(e+'denied'), value: channel.permissionOverwrites.mapValues((o)=>o.deny.bitfield.toString(16)).array().toString(), inline: true}
				).setTimestamp();
				l.reply('info.createchannel.success',channel.toString())
				msg.channel.send(embed)
				return
			}).catch( (error) => {
				if(error.code === 30013) l.send('info.createchannel.30013')
				else l.reply('errors.unknown')
				console.error(error)
			});
		}
		// Ejecución
		data!.type = type
        msg.guild!.channels.create(name,data!).then(async (channel) => {
			const e = 'info.createchannel.embed.'
			const getCategory = ()=>{
				if(channel.parent) return channel.parent.name
				else return no_cat
			};
			const embed = new MessageEmbed().setTitle(await l.translate(e+'title')).setColor(0)
			.addFields(
				{ name: await l.translate(e+'name'), value: channel.name, inline: true},
				{ name: await l.translate(e+'position'), value: '' + channel.position, inline: true},
				{ name: await l.translate(e+'category'), value: getCategory(), inline: true},
				{ name: await l.translate(e+'allowed'), value: channel.permissionOverwrites.mapValues((o)=>o.allow.bitfield.toString(16)).array().toString(), inline: true},
				{ name: await l.translate(e+'denied'), value: channel.permissionOverwrites.mapValues((o)=>o.deny.bitfield.toString(16)).array().toString(), inline: true}
			).setTimestamp();
			l.reply('info.createchannel.success',channel.toString())
			msg.channel.send(embed)
			return
		}).catch( (error) => {
			if(error.code === 30013) l.send('info.createchannel.30013')
			else l.reply('errors.unknown')
			console.error(error)
		});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
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

function createData(msg: Message,str:string): GuildCreateChannelOptions | undefined {
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
	const allowed_roles_match = str.match(/allow-roles \[([^\]]+)\]/)
	const allowed_roles = new Map<string,PermissionString[]>()
	if (allowed_roles_match !== null) {
		allowed_roles_match.forEach(match => {
			const properties_match = properties_regex.exec(match)
			if(properties_match !== null) {
			// The result can be accessed through the `m`-variable.
			properties_match.forEach(role_property => {
				if(!role_property.startsWith('{') || !role_property.endsWith('}')) return
				const role_property_split = role_property.slice(1,-1).split(':')
				if(role_property_split.length != 2) return
				const key = role_property_split[0]
				const role = RoleFinder.getRole(msg, key)
				if(!role) return
				const values = role_property_split[1].split(',').map(s=>s.toUpperCase()).filter(s=>{
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
	const denied_roles_match = str.match(/deny-roles \[([^\]]+)\]/)
	const denied_roles = new Map<string,PermissionString[]>()
	if (denied_roles_match !== null) {
		denied_roles_match.forEach(match => {
			const properties_match = properties_regex.exec(match)
			if(properties_match !== null) {
			// The result can be accessed through the `m`-variable.
			properties_match.forEach(role_property => {
				if(!role_property.startsWith('{') || !role_property.endsWith('}')) return
				const role_property_split = role_property.slice(1,-1).split(':')
				if(role_property_split.length != 2) return
				const key = role_property_split[0]
				const role = RoleFinder.getRole(msg, key)
				if(!role) return
				const values = role_property_split[1].split(',').map(s=>s.toUpperCase()).filter(s=>Object.keys(Permissions.FLAGS).includes(s));
				if(values.length < 1) return
				denied_roles.set(role.id,<PermissionString[]> values)
			});
			}
		});
	}
	const allowed_users_match = str.match(/allow-users \[([^\]]+)\]/)
	const allowed_users = new Map<string,PermissionString[]>()
	if (allowed_users_match !== null) {
		allowed_users_match.forEach(match => {
			const properties_match = properties_regex.exec(match)
			if(properties_match !== null) {
			// The result can be accessed through the `m`-variable.
			properties_match.forEach(role_property => {
				if(!role_property.startsWith('{') || !role_property.endsWith('}')) return
				const role_property_split = role_property.slice(1,-1).split(':')
				if(role_property_split.length != 2) return
				const key = role_property_split[0]
				const member = MemberFinder.getMember(msg, key)
				if(!member) return
				const values = role_property_split[1].split(',').map(s=>s.toUpperCase()).filter(s=>Object.keys(Permissions.FLAGS).includes(s));
				if(values.length < 1) return
				allowed_users.set(member.id,<PermissionString[]> values)
			});
			}
		});
	}
	const denied_users_match = str.match(/allow-users \[([^\]]+)\]/)
	const denied_users = new Map<string,PermissionString[]>()
	if (denied_users_match !== null) {
		denied_users_match.forEach(match => {
			const properties_match = properties_regex.exec(match)
			if(properties_match !== null) {
			// The result can be accessed through the `m`-variable.
			properties_match.forEach(role_property => {
				if(!role_property.startsWith('{') || !role_property.endsWith('}')) return
				const role_property_split = role_property.slice(1,-1).split(':')
				if(role_property_split.length != 2) return
				const key = role_property_split[0]
				const member = MemberFinder.getMember(msg, key)
				if(!member) return
				const values = role_property_split[1].split(',').map(s=>s.toUpperCase()).filter(s=>Object.keys(Permissions.FLAGS).includes(s));
				if(values.length < 1) return
				denied_users.set(member.id,<PermissionString[]> values)
			});
			}
		});
	}
	// Default Values
	var data: GuildCreateChannelOptions = {
	  topic: '',
	  position: 0,
	  nsfw: false,
	  parent: undefined,
	  permissionOverwrites: undefined
	};
	// Setting values
	for (const [key,value] of properties) {
	  switch (key.toLowerCase()) {
	  case 'position': case 'pos':
		data.position = parseInt(value)
		if (isNaN(data.position)) {
			console.error('valor position (' + value + ') no es un número')
			data.position = 0
		}
		data.parent = setParent(data.position, msg.guild!)
		break
	  case 'topic':
		  data.topic = value
		  break
	  case 'nsfw':
		  if(value == 'true') data.nsfw =true
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
function setParent(position: number, guild: Guild){
	var i = 0
	for (const channel of guild.channels.cache.values()) {
		if(channel.type === 'category'){
			const category = <CategoryChannel> channel
			// Verificar que position sea menor a la cantidad de canales de la categoría
			const channels = category.children.size
			if(position <= channels) return category.id
			else i += channels
		}
	}
	const lastCategory = guild.channels.cache.filter(channel=>{if(channel.type === 'category') return true;else return false;}).last()
	if(lastCategory) return lastCategory.id
	else return undefined
}