import ArgCommand from "./commandArgInterface";
import { Message, Role, RoleData, Permissions } from "discord.js";
import { RoleFinder } from "../util/RoleFinder";

export class EditRoleCommand implements ArgCommand {
	commandNames: string[] = ['editrole','er']
	requiredArgs: number = 1
	examples: string[] = ['123456789987654321 pos: 10', '@cualquier nombre {name:otro nombre,color:RED}', '"mod" +manage_roles']
	usage: string = '<rol> <dato:valor> [dato:valor]... [+/-alterno]....'
	guildExclusive: boolean = true
	async run(msg: Message, args: string[]): Promise<void> {
		const botposition = msg.guild!.member(msg.client.user!)!.roles.highest.position
		// Se asume a la mención de rol como la primera palabra de los argumentos
		var mention = args[0]
		// Se busca el patrón donde el nombre de rol puede estar
		const regex = args.join(' ').match(/([^{]+) {?.+}?/)
		// Si hay match el nombre de rol es lo señalado en el patrón
		if (regex) mention = regex[1]
		// En caso de no existir el nombre en el patrón, se resatura al valor anterior
		if (!mention || mention.length == 0) mention = args[0]
		const role = RoleFinder.getRole(msg,mention.trim())
		if(!role){
			msg.reply(`el rol ${args[0]} no pudo ser encontrado, intente con la ID o poniendo el nombre entre comillas`)
			return
		}
		if (!role.editable) {
			msg.reply('el rol puede ser editado, intenta ponerlo más abajo que mi rol superior. También verifica que tenga el permiso de gestionar roles.')
		}
		// A partir de aquí se asume al rol como existente

		// 1. Detectar si hay una sola variable a editar
		const properties = args.join(' ').slice(mention.length + 1)
		const propRegex = properties.match(/^(\w+) ?:(.+)/) || properties.match(/\+\w+|-\w+/)
		if(propRegex){
			if (propRegex.length==1) {
				// +/-

			}else{
				const value = propRegex[1].trim()
				switch (propRegex[0].trim().toLowerCase()) {
					case 'name':
						await role.setName(value,`Comando ejecutado por ${msg.author!.tag}`).then(r=>msg.reply(`**${role.name}** ahora se llama **${r.name}**`)).catch(err=>{
							msg.reply(`no pude renombrar al rol como ${value}.`)
							console.error(`Se renombrar al rol @${role.name} como @${value}, pero falló por ${err}`)
						})
						return
					case 'color':
						await role.setColor(value,`Comando ejecutado por ${msg.author!.tag}`).then(r=>msg.reply(`**${role.name}** ahora es color **${r.hexColor}**`)).catch(err=>{
							msg.reply(`no pude ponerle el color ${value} al rol.`)
							console.error(`Se intentó poner el color ${value} al rol @${role.name}, pero falló por ${err}`)
						})
						return
					case 'perms': case 'permissions':
						const perms = parseInt(value,16)
						if(isNaN(perms)){
							msg.reply('el número en hexadecimal no es válido, tiene que ser la suma en binario de todos los permisos a poner en el rol. Si solo quieres agregar o quitar un permiso usa el argumento \`+permiso\` o \`-permiso\`. Ejemplo: +ban_members')
							return
						}
						await role.setPermissions(perms,`Comando ejecutado por ${msg.author!.tag}`).then(r=>msg.reply(`**${role.name}** ahora tiene los permisos \`${r.permissions.toArray().toString()}\``)).catch(err=>{
							msg.reply(`no pude cambiarle los permisos a ${value} al rol. Quizás estás poniendo más permisos de los que puedo permitir.`)
							console.error(`Se intentó poner el set de permisos ${value} al rol @${role.name}, pero falló por ${err}`)})
						return
					case 'position':
						const pos = parseInt(value)
						if(isNaN(pos)){
							msg.reply(`${value} no es un número válido`)
							return
						}
						if (pos >= botposition) {
							msg.reply('no puedo cambiar la posición del rol si es igual o mayor a mi rol más alto')
							return
						}
						await role.setPosition(pos,{relative: false,reason:`Comando ejecutado por ${msg.author!.tag}`}).then(r=>msg.reply(`**${role.name}** ahora está en la posición \`${r.position}\``)).catch(err=>{
							msg.reply(`no pude cambiar la posición del rol a ${value}. Quizás estás poniendo más permisos de los que puedo permitir.`)
							console.error(`Se intentó cambiar la posición a ${value} al rol @${role.name}, pero falló por ${err}`)})
						return
					// Próximamente, above below
				}
			}
		}
		//2. Si hay más variables a editar, utilizar la función de crear data
		const data = createData(properties, role)
		if(!data){
			msg.reply('el formato ingresado no es válido. El formato correcto es { dato:valor, dato:valor, *...* }')
			return
		}
		role.edit(data,`Comando ejecutado por ${msg.author.tag}`).then(r=>msg.channel.send(`Rol **${r.name}** modificado correctamente`))
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			msg.reply('no tengo el permiso para editar roles.')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			msg.reply('no tienes permiso de editar roles.')
			return false
		}
		return true
	}
}
function createData(str:string, oldRole:Role):RoleData | undefined {
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
	  name: oldRole.name,
	  position: oldRole.position,
	  permissions: oldRole.permissions,
	  color: oldRole.color,
	  hoist: oldRole.hoist,
	  mentionable: oldRole.mentionable
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
		data.position = parseInt(value)
		if (isNaN(data.position)) {
			console.error('valor position no es un número')
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