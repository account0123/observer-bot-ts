import ArgCommand from "./commandArgInterface";
import { Message, Role, RoleData, Permissions, PermissionString } from "discord.js";
import { RoleFinder } from "../util/RoleFinder";
import { inflateSync } from "zlib";

export class EditRoleCommand implements ArgCommand {
	permission: string = 'Gestionar roles'
	shortdescription: string = 'Edita un rol.'
	fulldescription: string = 'Edita un dato o varios datos del rol indicado...'
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
				const sign = propRegex[0].slice(0,1)
				var action = ''
				if (sign === '+') action = 'add'
				if (sign === '-') action = 'remove'
				const target = propRegex[0].slice(1)
				switch (target) {
					case 'hoist':
						if(action==='add'){
							await role.setHoist(true,`Comando ejecutado por ${msg.author!.tag}`).then(r=>msg.reply(`**${role.name}** ahora **se muestra**`)).catch(err=>{
							msg.reply(`no pude cambiar el rol a **destacado**.`)
							console.error(`Se intentó poner el rol @${role.name} como destacado, pero falló por ${err}`)});
						}
						if(action==='remove'){
							await role.setHoist(false,`Comando ejecutado por ${msg.author!.tag}`).then(r=>msg.reply(`**${role.name}** ahora **no se muestra**`)).catch(err=>{
								msg.reply(`no pude cambiar el rol a **oculto**.`)
								console.error(`Se intentó poner el rol @${role.name} como oculto, pero falló por ${err}`)});
						}
						return
					case 'mentionable':
						if(action==='add'){
							await role.setMentionable(true,`Comando ejecutado por ${msg.author!.tag}`).then(r=>msg.reply(`**${role.name}** ahora **es 100% mencionable**`)).catch(err=>{
							msg.reply(`no pude cambiar el rol a **mencionable**.`)
							console.error(`Se intentó poner el rol @${role.name} como mencionable, pero falló por ${err}`)});
						}
						if(action==='remove'){
							await role.setMentionable(false,`Comando ejecutado por ${msg.author!.tag}`).then(r=>msg.reply(`**${r.name}** ahora **no es mencionable**(a menos que tengas el permiso de mencionar roles)`)).catch(err=>{
								msg.reply(`no pude cambiar el rol a **no mencionable**.`)
								console.error(`Se intentó poner el rol @${role.name} como no mencionable, pero falló por ${err}`)});
						}
						return
					default:
						let permission:PermissionString
						for (const flag in Permissions.FLAGS) {
							if(target.toLowerCase().trim() === flag){
								if (action==='add') {
									permission = <PermissionString> flag
									role.permissions.add(permission)
									await msg.reply(`**${role.name}** ahora tiene el permiso **${flag}** agregado.`)
									return
								}
								if(action==='remove'){
									permission = <PermissionString> flag
									role.permissions.remove(permission)
									await msg.reply(`**${role.name}** ahora tiene el permiso **${flag}** agregado.`)
									return
								}
							}
						}
						await msg.reply(`**${role.name}** sin cambios`)
						return
				}
			}else{
				const value = propRegex[1].trim()
				switch (propRegex[0].trim().toLowerCase()) {
					case 'name':
						await role.setName(value,`Comando ejecutado por ${msg.author!.tag}`).then(r=>msg.reply(`**${role.name}** ahora se llama **${r.name}**`)).catch(err=>{
							msg.reply(`no pude renombrar al rol como ${value}.`)
							console.error(`Se intentó renombrar al rol @${role.name} como @${value}, pero falló por ${err}`)
						});
						return
					case 'color':
						await role.setColor(value,`Comando ejecutado por ${msg.author!.tag}`).then(r=>msg.reply(`**${role.name}** ahora es color **${r.hexColor}**`)).catch(err=>{
							msg.reply(`no pude ponerle el color ${value} al rol.`)
							console.error(`Se intentó poner el color ${value} al rol @${role.name}, pero falló por ${err}`)
						});
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
					case 'position': case 'pos':
						const position = parseInt(value)
						if(isNaN(position)){
							msg.reply(`${value} no es un número válido`)
							return
						}
						if (position >= botposition) {
							msg.reply('no puedo cambiar la posición del rol si es igual o mayor a mi rol más alto')
							return
						}
						await role.setPosition(position,{relative: false,reason:`Comando ejecutado por ${msg.author!.tag}`}).then(r=>msg.reply(`**${role.name}** ahora está en la posición \`${r.position}\``)).catch(err=>{
							msg.reply(`no pude cambiar la posición del rol a ${value}.`)
							console.error(`Se intentó cambiar la posición a ${value} al rol @${role.name}, pero falló por ${err}`)});
						return
					case 'above':
						const lowerRole = RoleFinder.getRole(msg,value)
						if(!lowerRole){
							msg.reply('el rol inferior no es válido.')
							return
						}
						const pos_b = lowerRole.position + 1
						if (pos_b >= botposition) {
							msg.reply('no puedo cambiar la posición del rol si es igual o mayor a mi rol más alto')
							return
						}
						await role.setPosition(pos_b,{relative: false,reason: `Comando ejecutado por ${msg.author.tag}`}).then(r=>msg.reply(`**${role.name}** ahora está en la posición \`${r.position}\``)).catch(err=>{
							msg.reply(`no pude cambiar la posición del rol a ${value}.`)
							console.error(`Se intentó cambiar la posición a ${value} al rol @${role.name}, pero falló por ${err}`)});
						return
					case 'below':
						const higherRole = RoleFinder.getRole(msg,value)
						if (!higherRole) {
							msg.reply('el rol superior no es válido.')
							return
						}
						let pos_c = higherRole.position - 1
						if (pos_c >= botposition) {
							msg.reply('no puedo cambiar la posición del rol si es igual o mayor a mi rol más alto')
						}
						await role.setPosition(pos_c,{reason:`Comando ejecutado por ${msg.author.tag}`}).then(r=>msg.reply(`**${role.name}** ahora está en la posición \`${r.position}\``)).catch(err=>{
							msg.reply(`no pude cambiar la posición del rol a ${value}.`)
							console.error(`Se intentó cambiar la posición a ${value} al rol @${role.name}, pero falló por ${err}`)});
						return
					}
			}
		}
		//2. Si hay más variables a editar, utilizar la función de crear data
		const data = createData(msg,properties, role)
		if(!data){
			msg.reply('el formato ingresado no es válido. El formato correcto es { dato:valor, dato:valor, *...* }')
			return
		}
		if (data.name == role.name && data.position == role.position && data.color == role.color && data.permissions == role.permissions && data.hoist == role.hoist && data.mentionable == role.mentionable) {
			msg.reply('*No hay cambios.*')
			return
		}
		await role.edit(data,`Comando ejecutado por ${msg.author.tag}`).then(r=>msg.channel.send(`Rol **${r.name}** modificado correctamente`))
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
function createData(msg:Message,str:string, oldRole:Role):RoleData | undefined {
	const botposition = msg.guild!.member(msg.client.user!)!.roles.highest.position
	if(!str.startsWith('{') && !str.endsWith('}')) return undefined
	const body = str.slice(1,-1)
	if(!body || body.length < 6) return undefined
	const map = body.split(',')
	const properties = new Map()
	map.forEach(s=>{
	  const splits = s.trim().split(':')
	  const key = splits[0].trim()
	  const sign = key.slice(0,1)
	  const target = key.slice(1)
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
		if(isNaN(data.permissions)) data.permissions = oldRole.permissions
		break
		case 'above':
			const lowerRole = RoleFinder.getRole(msg,value)
			if(!lowerRole) break
			const pos = lowerRole.position + 1
			if (pos >= botposition) {
				msg.channel.send('Advertencia: No puedo cambiar la posición del rol si es igual o mayor a mi rol más alto')
				break
			}
			data.position = pos
		break
		case 'below':
			const higherRole = RoleFinder.getRole(msg,value)
			if (!higherRole) break
			const pos_c = higherRole.position - 1
			if (pos_c >= botposition) {
				msg.channel.send('Advertencia: No puedo cambiar la posición del rol si es igual o mayor a mi rol más alto')
				break
			}
			data.position = pos_c
		break
		case 'position': case 'pos':
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