 import ArgCommand from "./commandArgInterface";
import { Message, Permissions, MessageEmbed, RoleData, CreateRoleOptions} from "discord.js";
import { Lang } from "./lang/Lang";
import { MemberFinder } from "../util/MemberFinder";

export class CreateRoleCommand implements ArgCommand{
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
						  `${await l.translate(e+'name')}: ${role.name}\n\`Color\`: ${role.hexColor}\n
						  ${await l.translate(e+'position')}: ${role.position}\n
						  ${await l.translate(e+'hoist')}: ${isHoist()}\n
						  ${await l.translate(e+'mentionable')}: ${isMentionable()}\n
						  ${await l.translate(e+'permissions')}: ${role.permissions.toJSON()}`)
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
				`${await l.translate(e+'name')}: ${role.name}\n\`Color\`: ${role.hexColor}\n
				${await l.translate(e+'position')}: ${role.position}\n
				${await l.translate(e+'hoist')}: ${isHoist()}\n
				${await l.translate(e+'mentionable')}: ${isMentionable()}\n
				${await l.translate(e+'permissions')}: ${role.permissions.toJSON()}`)
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
