import ArgCommand from "./commandArgInterface";
import { Message, Permissions, MessageEmbed, RoleData, Collection } from "discord.js";
import { RoleFinder } from "../util/RoleFinder";

export class CreateRoleCommand implements ArgCommand{
	commandNames: string[] = ['createrole', 'cr']
	requiredArgs: number = 1
	examples: string[] = ['\"rojo fuerte\" #ff0000 !verde oscuro', 'Admin #ffff00 0x7ffffff ^@Mods -hoist -mentionable', 'usuarios -hoist']
	usage:string = '<nombre del rol> [color] [permisos] [^rol inferior] [!rol superior] [-hoist] [-mentionable]'
	guildExclusive: boolean = true
	async run(msg: Message, args: string[]): Promise<void> {
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			msg.reply('no tengo el permiso de gestionar roles, así que tampoco puedo crearlos')
			return
		}
		const mod = msg.guild.members.cache.get(msg.author!.id)!
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
		  msg.reply('no tienes permiso para crear roles')
		  return
		}
		// nuevo código
		const arg = args.join(' ')
		const data = stringify(arg)
    
		if (data.position >= bot.roles.highest.position) {
			msg.reply('el rol que vas a crear está igual o más alto que todos mis roles juntos, así que hasta aquí hemos llegado')
			return
		}
        // Ejecución
        msg.guild!.roles.create({data}).then((role) => {
            const relative = () => { if (hrolepos > 0) return 'Encima de'; if (lrolepos > 0) return 'Debajo de'; return '\u200B'};
            const rolerelative = () => { if (hrolepos > 0) return `${hrole} (${hrole!.position})`; if (lrolepos > 0) return `${lrole} (${lrole!.position})`; return '\u200B'}
            const embed = new MessageEmbed().setTitle('Detalles:')
                .addFields(
                    { name: 'Color:', value: role.hexColor, inline: true},
                    { name: 'Posición', value: role.position, inline: true},
                    { name: relative(), value: rolerelative(), inline: true},
                    { name: 'Permisos:', value: role.permissions.toArray()}
                    )
                .setTimestamp();
            msg.reply(`el rol ${role} fue creado sin problemas.`, embed)
        }).catch( (error) => {
			msg.reply('Error inesperado!!!')
			console.error(error)
		});
	}
	stringify(str:string):RoleData {
	  if(!str.startsWith('{') && !str.endsWith('}')) return 'invalid_format'
	  const body = str.slice(1,-1)
	  if(!body || body.length < 6) return 'no_body'
	  const map = body.split(',')
	  const properties = new Map()
	  map.forEach(s=>{
	    const splits = s.trim().split(':')
	    const key = splits[0].trim()
	    if(key == 'hoist') splits[1] = 'true'
	    if(key == 'mentionable') splits[1] = 'true'
	    if (splits.length != 2) continue
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
        case 'position':
          data.position = value
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
}
