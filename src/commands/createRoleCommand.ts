import { Message, Permissions, MessageEmbed, RoleData, CreateRoleOptions, CacheType, CommandInteraction, ColorResolvable, Util} from "discord.js";
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
		const bot = MemberFinder.getMember(msg, msg.client.user.id)
		if(!bot) return
		// nuevo código
		const [yes, no] = await Promise.all([l.translate('yes'), l.translate('no')])
		const arg = args.join(' ')
		const data = createData(arg, await l.translate('reason',msg.author.tag))
		if (!data) {
			g.roles.create({name: arg, permissions: 0n, color: 'RANDOM', reason: await l.translate('reason',msg.author.tag)})
        .then(async (role) => {
			const isHoist = ()=> role.hoist ? yes : no
			const isMentionable = ()=>role.mentionable? yes : no
			const e = 'info.createrole.embed.'
			const embed = new MessageEmbed().setTitle(await l.translate(e+'title')).setColor(role.color || 0)
				.addField('\u200B',
					`${await l.translate(e+'name')}: ${role.name}\n\`Color\`: ${role.hexColor}
					${await l.translate(e+'position')}: ${role.position}`, true)
				.addField('\u200B',`
					${await l.translate(e+'permissions')}: ${role.permissions.toJSON()}
					${await l.translate(e+'hoist')}: ${isHoist()}
					${await l.translate(e+'mentionable')}: ${isMentionable()}`, true)
				.setTimestamp();
				const content = await l.translate('info.createrole.success',role.toString())
				msg.channel.send({content, embeds: [embed]})
			}).catch( (error) => {
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
        g.roles.create(data).then(async (role) => {
			const isHoist = ()=> role.hoist ? yes : no
			const isMentionable = ()=>role.mentionable? yes : no
			const e = 'info.createrole.embed.'
			const embed = new MessageEmbed().setTitle('Detalles:').setColor(data.color || 0)
			.addField('\u200B',
					`${await l.translate(e+'name')}: ${role.name}\n\`Color\`: ${role.hexColor}
					${await l.translate(e+'position')}: ${role.position}`, true)
			.addField('\u200B',
				`${await l.translate(e+'permissions')}: ${role.permissions.toJSON()}
				${await l.translate(e+'hoist')}: ${isHoist()}
				${await l.translate(e+'mentionable')}: ${isMentionable()}`, true)
			.setTimestamp();
			const content = await l.translate('info.createrole.success',role.toString())
			msg.channel.send({content, embeds: [embed]})
        }).catch( (error) => {
			if(error.code === 30005) l.send('info.createrole.30005')
			else l.reply('errors.unknown')
			console.error(error.stack)
		});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild || !msg.client.user) return false
		const mod = MemberFinder.getMember(msg, msg.author.id)
		const bot = MemberFinder.getMember(msg, msg.client.user.id)
		if(!mod || !bot) return false
		if (!bot.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.botperms.create_role')
			return false
		}
		if (!mod.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.create_role')
			return false
		}
		return true
	}

	static get(): any {
		const s = new SlashCommandBuilder()
		.setName('createrole')
		.setDescription('Creates a role as you want')
		.addStringOption(op=>op.setName('name').setDescription('The name of the new role').setRequired(true))
		.addStringOption(op=>op.setName('color').setDescription('The color of the new role'))
		.addStringOption(op=>op.setName('permissions').setDescription('Hexadecimal code representing the permissions of the role'))
		.addBooleanOption(op=>op.setName('mentionable').setDescription('Everyone can mention this role'))
		.addBooleanOption(op=>op.setName('hoist').setDescription('This role is shown in members list'))
		return s.toJSON()
	}
	
	async verify(interaction: CommandInteraction<CacheType>, l: InteractionLang): Promise<boolean> {
		const bot = interaction.client.user
		if(!bot) return false
		if(!interaction.guild) return false
		const botmember = interaction.guild.members.resolve(bot)
		if(!botmember) return false
		if(!interaction.memberPermissions) return false

		if(!botmember.permissions.has(Permissions.FLAGS.MANAGE_ROLES, true)){
			l.reply('errors.botperms.create_role')
			return false
		}
		if(!interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_ROLES, true)){
			l.reply('errors.modperms.create_role')
			return false
		}
		return true
	}
	async interact(interaction: CommandInteraction<CacheType>, l: InteractionLang): Promise<void> {
		if(!interaction.guild)
			return interaction.reply({content: await l.translate('errors.no_dms'), ephemeral: true})
		// Declaration
		const name = interaction.options.getString('name', true)
		const input_color = <ColorResolvable>interaction.options.getString('color') || 'RANDOM'
		const input_permissions = interaction.options.getString('permissions') || '0'
		const mentionable = interaction.options.getBoolean('mentionable') || false
		const hoist = interaction.options.getBoolean('hoist') || false
		const [yes, no] = await Promise.all([l.translate('yes'), l.translate('no')])
		const color = Util.resolveColor(input_color)
		const permissions = Permissions.resolve(BigInt(parseInt(input_permissions, 16)))
		interaction.guild.roles.create({name, color, permissions, mentionable, hoist})
		.then(async (role) => {
			const isHoist = ()=> role.hoist ? yes : no
			const isMentionable = ()=>role.mentionable? yes : no
			const e = 'info.createrole.embed.'
			const embed = new MessageEmbed().setTitle('Detalles:').setColor(role.color || 0)
			.addField('\u200B',
				`${await l.translate(e+'name')}: \`${role.name}\`\n**Color**: \`${role.hexColor}\`
				${await l.translate(e+'position')}: \`${role.position}\``, true)
			.addField('\u200B',
				`${await l.translate(e+'permissions')}: \`${role.permissions.toJSON()}\`
				${await l.translate(e+'hoist')}: \`${isHoist()}\`
				${await l.translate(e+'mentionable')}: \`${isMentionable()}\``, true)
			.setTimestamp();
			const content = await l.translate('info.createrole.success',role.toString())
			interaction.reply({content, embeds: [embed]})
        }).catch( (error) => {
			if(error.code === 30005) l.reply('info.createrole.30005')
			else l.reply('errors.unknown')
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
		if(value=='user') data.permissions = Permissions.DEFAULT
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
