import ArgCommand from "./commandArgInterface";
import { Message, Permissions, MessageEmbed, RoleData} from "discord.js";
import { Lang } from "./lang/Lang";

export class CreateRoleCommand implements ArgCommand{
	permission: string = 'MANAGE_ROLES'
	shortdescription: string = 'info.createrole.description'
	fulldescription: string = 'info.createrole.fulldescription';
	commandNames: string[] = ['createrole', 'cr']
	requiredArgs: number = 1
	examples: string[] = ['{name:strong red, color: #ff0000}', '{ name:Admin, color:ffff00, permissions:0x7fffffff,hoist, mentionable}', '{name: users, hoist}']
	usage:string = 'info.createrole.usage'
	guildExclusive: boolean = true
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const bot = msg.guild!.member(msg.client.user!)!
		// nuevo código
		const arg = args.join(' ')
		const data = createData(arg)
		if (!data) {
			msg.guild!.roles.create({data: {name: arg,permissions:Permissions.DEFAULT,color:'RANDOM'}, reason: l.translate('reason',msg.author.tag)}).then((role) => {
				const e = 'info.createrole.embed.'
				const embed = new MessageEmbed().setTitle(l.translate(e+'title')).setColor(role.color || 0)
					.addFields(
						{ name: l.translate(e+'name')       , value: role.name                 , inline: true},
						{ name: l.translate(e+'color')      , value: role.hexColor             , inline: true},
						{ name: l.translate(e+'position')   , value: role.position             , inline: true},
						{ name: l.translate(e+'hoist')      , value: (()=>role.hoist?l.translate('yes'):l.translate('no')), inline: true},
						{ name: l.translate(e+'mentionable'), value: (()=>role.hoist?l.translate('yes'):l.translate('no')), inline: true},
						{ name: l.translate(e+'permissions'), value: role.permissions.toJSON()}
						)
					.setTimestamp();
				l.reply('info.createrole.success',msg,role.toString())
				msg.channel.send(embed)
			}).catch( (error) => {
				if(error.code === 30005) l.translate('info.createrole.30005')
				else l.reply('errors.unknown',msg)
				console.error(error)
			});
			return
		}
		if (data.position! >= bot.roles.highest.position) {
			l.reply('info.createrole.high_position',msg)
			return
		}
		console.log('Creando rol ' + data.toString())
        // Ejecución
        msg.guild!.roles.create({data: data, reason: l.translate('reason',msg.author.tag)}).then((role) => {
			const e = 'info.createrole.embed.'
			const embed = new MessageEmbed().setTitle('Detalles:').setColor(data.color || 0)
				.addFields(
				{ name: l.translate(e+'name')       , value: role.name                 , inline: true},
				{ name: l.translate(e+'color')      , value: role.hexColor             , inline: true},
				{ name: l.translate(e+'position')   , value: role.position             , inline: true},
				{ name: l.translate(e+'hoist')      , value: (()=>role.hoist?l.translate('yes'):l.translate('no')), inline: true},
				{ name: l.translate(e+'mentionable'), value: (()=>role.hoist?l.translate('yes'):l.translate('no')), inline: true},
				{ name: l.translate(e+'permissions'), value: role.permissions.toJSON()}
				)
            	.setTimestamp();
            msg.reply(`el rol ${role} fue creado sin problemas.`, embed)
        }).catch( (error) => {
			if(error.code === 30005) l.translate('info.createrole.30005')
			else l.reply('errors.unknown',msg)
			console.error(error.stack)
		});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.botperms.create_role',msg)
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.create_role',msg)
			return false
		}
		return true
	}
}

function createData(str:string):RoleData | undefined {
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
	var data: RoleData = {
	  name: 'new role',
	  position: 0,
	  permissions: 0,
	  color: 0,
	  hoist: false,
	  mentionable: false
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
		data.permissions = parseInt(value,16)
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