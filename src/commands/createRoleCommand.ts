import { Message, RoleData, CreateRoleOptions, CacheType, CommandInteraction, ColorResolvable, RESTPostAPIApplicationCommandsJSONBody, EmbedBuilder, Role, ChatInputCommandInteraction, resolveColor, PermissionsBitField} from "discord.js";
import { InteractionLang, Lang } from "./lang/Lang";
import { MemberFinder } from "../util/MemberFinder";
import SlashCommand from "./slashCommandInterface";
import { SlashCommandBuilder } from '@discordjs/builders';

export class CreateRoleCommand implements SlashCommand{
	permission = 'MANAGE_ROLES'
	shortdescription = 'info.createrole.description'
	fulldescription = 'info.createrole.fulldescription';
	commandNames: string[] = ['createrole', 'cr']
	requiredArgs = 1
	examples: string[] = ['{name:strong red, color: #ff0000}', '{ name:Admin, color:ffff00, permissions:0x7fffffff,hoist, mentionable}', '{name: users, hoist}']
	usage = 'info.createrole.usage'
	type = 'manage'
	guildExclusive = true
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const g = msg.guild
		if(!g || !msg.client.user) return
		const bot = MemberFinder.getMember(g, msg.client.user.id)
		if(!bot) return
		// nuevo código
		
		const arg = args.join(' ')
		const data = createData(arg, await l.translate('reason',msg.author.tag))
		if (!data) {
			g.roles.create({name: arg, permissions: 0n, color: 'Random', reason: await l.translate('reason',msg.author.tag)})
        .then(async (role)=>{
			const content = await l.translate('info.createrole.success',role.toString())
			const embed = await this.createResponse(role, l)
			msg.channel.send({content, embeds: [embed]})
		})
		.catch( (error) => {
				if(error.code === 30005) l.send('info.createrole.30005')
				else l.reply('errors.unknown')
				console.error(error)
			});
			return
		}
		if (data.position && (data.position >= bot.roles.highest.position)) {
			l.reply('info.createrole.high_position')
			return
		}
		console.log('Creando rol ' + data.toString())
		// Ejecución
        g.roles.create(data).then(async (role)=>{
			const content = await l.translate('info.createrole.success',role.toString())
			const embed = await this.createResponse(role, l)
			msg.channel.send({content, embeds: [embed]})
		}).catch((error)=>{
			if(error.code === 30005) l.send('info.createrole.30005')
			else l.reply('errors.unknown')
			console.error(error.stack)
		});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const mod = MemberFinder.getMember(msg.guild, msg.author.id)
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!mod || !bot) return false
		if (!bot.permissions.has('ManageRoles')) {
			l.reply('errors.botperms.create_role')
			return false
		}
		if (!mod.permissions.has('ManageRoles')) {
			l.reply('errors.modperms.create_role')
			return false
		}
		return true
	}
	async createResponse(role: Role, l: Lang | InteractionLang): Promise<EmbedBuilder>{
		const [yes, no] = await Promise.all([l.translate('yes'), l.translate('no')])
		const isHoist = ()=> role.hoist ? yes : no
		const isMentionable = ()=>role.mentionable? yes : no
		const e = 'info.createrole.embed.'
		return new EmbedBuilder().setTitle(await l.translate(e+'title')).setColor(role.color || 0)
		.addFields([{
			name: '\u200B',
			value: `${await l.translate(e+'name')}: ${role.name}\n\`Color\`: ${role.hexColor}\n${await l.translate(e+'position')}: ${role.position}`,
			inline: true
		},
		{
			name: '\u200B',
			value:`${await l.translate(e+'permissions')}: ${role.permissions.toJSON()}
				${await l.translate(e+'hoist')}: ${isHoist()}
				${await l.translate(e+'mentionable')}: ${isMentionable()}`,
			inline: true
		}]).setTimestamp()
	}

	static get(): RESTPostAPIApplicationCommandsJSONBody {
		const s = new SlashCommandBuilder()
		.setName('createrole')
		.setDescription('Creates a role as you want')
		.addStringOption(op=>op.setName('name').setDescription('The name of the new role').setRequired(true))
		.addStringOption(op=>op.setName('color').setDescription('The color of the new role'))
		.addIntegerOption(op=>op.setName('position').setDescription('Position of the role'))
		.addStringOption(op=>op.setName('permissions').setDescription('Hexadecimal code representing the permissions of the role'))
		.addBooleanOption(op=>op.setName('mentionable').setDescription('Everyone can mention this role'))
		.addBooleanOption(op=>op.setName('hoist').setDescription('This role is shown in members list'))
		return s.toJSON()
	}
	
	async verify(interaction: CommandInteraction<CacheType>, l: InteractionLang): Promise<boolean> {
		if(!interaction.guild || !interaction.memberPermissions || !interaction.appPermissions) return false

		if(!interaction.appPermissions.has('ManageRoles')){
			l.reply('errors.botperms.create_role')
			return false
		}
		if(!interaction.memberPermissions.has('ManageRoles')){
			l.reply('errors.modperms.create_role')
			return false
		}
		return true
	}
	async interact(interaction: ChatInputCommandInteraction, l: InteractionLang): Promise<void> {
		if(!interaction.guild){
			interaction.reply({content: await l.translate('errors.no_dms'), ephemeral: true})
			return
		}
		if(!interaction.appPermissions) return

		const name = interaction.options.getString('name', true)
		const input_color = <ColorResolvable>interaction.options.getString('color') || 'Random'
		const input_permissions = interaction.options.getString('permissions') || '0'
		const mentionable = interaction.options.getBoolean('mentionable') || false
		const position = interaction.options.getInteger('position')
		const bot = interaction.guild.members.resolve(interaction.applicationId)
		if(!bot) return
		if (position && (position >= bot.roles.highest.position)) {
			l.reply('info.createrole.high_position')
			return
		}
		const hoist = interaction.options.getBoolean('hoist') || false
		const color = resolveColor(input_color)
		const permissions = new PermissionsBitField(BigInt(parseInt(input_permissions.replace('#',''), 16)))
		const missing = interaction.appPermissions.missing(permissions).length
		if(missing > 0){
			interaction.reply({content: await l.translate('errors.high_perms'), ephemeral: true})
			return
		}
		interaction.guild.roles.create({name, color, permissions, mentionable, hoist})
		.then(async (role)=>{
			const content = await l.translate('info.createrole.success',role.toString())
			const embed = await this.createResponse(role, l)
			interaction.reply({content, embeds: [embed]})
        }).catch((error)=>{
			if(error.code === 30005) l.reply('info.createrole.30005')
			else l.reply('errors.unknown', error)
			console.error(error.stack)
		});
	}
}

function createData(str:string, reason: string):RoleData | undefined {
	if(!str.startsWith('{') && !str.endsWith('}')) return undefined
	const body = str.slice(1,-1)
	if(!body || body.length < 6) return undefined
	const map = body.split(',')
	const properties = new Map()
	map.forEach(s=>{
		const splits = s.trim().split(':')
		const key = splits[0].trim()
		if(key == 'hoist') splits[1] = 'true'
		if(key == 'mentionable') splits[1] = 'true'
		if (splits.length != 2) return
		properties.set(key,splits[1].trim())
	});
	// Default Values
	const data: CreateRoleOptions = {
		name: 'new role',
		position: 0,
		permissions: 0n,
		color: 0,
		hoist: false,
		mentionable: false,
		reason
	};
	// Setting values
	for (const [key,value] of properties) {
		switch (key.toLowerCase()) {
		case 'name':
		data.name = value
		break
		case 'color':
		data.color = value
		break
		case 'permissions': case 'perms':
		if(value=='user') data.permissions = PermissionsBitField.Default
		else data.permissions = BigInt(parseInt(value,16))
		break
		case 'position': case 'pos':
		data.position = parseInt(value)
		if (isNaN(data.position)) {
			console.error('valor position ('+value+') no es un número')
			data.position = 0
		}
		break
		case 'hoist':
		if(value == 'true') data.hoist =true
		break
		case 'mentionable':
		if(value == 'true') data.mentionable =true
		break
		}
	}
	return data
  }
