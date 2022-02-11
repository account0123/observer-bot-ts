import ArgCommand from "./commandArgInterface";
import { Message, Role, RoleData, Permissions, PermissionString, ColorResolvable } from "discord.js";
import { RoleFinder } from "../util/RoleFinder";
import { Lang } from "./lang/Lang";
import { MemberFinder } from "../util/MemberFinder";

export class EditRoleCommand implements ArgCommand {
	permission = 'MANAGE_ROLES'
	shortdescription = 'info.editrole.description'
	fulldescription = 'info.editrole.fulldescription'
	commandNames: string[] = ['editrole','er']
	requiredArgs = 2
	examples: string[] = ['123456789987654321 pos: 10', '@any rolename {name:another name,color:RED}', '"mod" +manage_roles']
	usage = 'info.editrole.usage'
	guildExclusive = true
	type = 'manage'
	async run(msg: Message, l:Lang, args: string[]): Promise<void> {
		const g = msg.guild
		if(!g || !msg.client.user) return
		const bot = MemberFinder.getMember(msg, msg.client.user.id)
		if(!bot) return
		const botposition = bot.roles.highest.position
		// Se asume a la mención de rol como la primera palabra de los argumentos
		let mention = args[0]
		// Se busca el patrón donde el nombre de rol puede estar
		const regex = args.join(' ').match(/"?([^"{]+)"? {?.+}?/)
		// Si hay match el nombre de rol es lo señalado en el patrón
		if (regex) mention = regex[1]
		// En caso de no existir el nombre en el patrón, se resatura al valor anterior
		if (!mention || mention.length == 0) mention = args[0]
		const role = RoleFinder.getRole(msg,mention.trim())
		if(!role){
			l.reply('info.editrole.not_found',args[0])
			return
		}
		if(botposition <= role.position){
			l.reply('errors.lower_roles')
			return
		}
		// A partir de aquí se asume al rol como existente

		// 1. Detectar si hay una sola variable a editar
		const tag = msg.author.tag
		const reason = await l.translate('reason', tag)
		const properties = args.join(' ').slice(mention.length + 1)
		const propRegex = properties.match(/^(\w+) ?:(.+)/) || properties.match(/\+\w+|-\w+/)
		if(propRegex){
			if (propRegex.length==1) {
				// +/-
				const sign = propRegex[0].slice(0,1)
				let action = ''
				if (sign === '+') action = 'add'
				if (sign === '-') action = 'remove'
				const target = propRegex[0].slice(1)
				switch (target) {
					case 'hoist':
						if(action==='add'){
							await role.setHoist(true,reason).then(r=>l.reply('info.editrole.hoist_change.add_success',r.name)).catch(err=>{
							l.reply('info.editrole.hoist_change.add_error')
							console.error(`Se intentó poner el rol @${role.name} como destacado, pero falló por ${err}`)});
						}
						if(action==='remove'){
							await role.setHoist(false,reason).then(r=>l.reply('info.editrole.hoist_change.remove_success',r.name)).catch(err=>{
								l.reply('info.editrole.hoist_change.remove_error')
								console.error(`Se intentó poner el rol @${role.name} como oculto, pero falló por ${err}`)});
						}
						return
					case 'mentionable':
						if(action==='add'){
							await role.setMentionable(true,reason).then(r=>l.reply('info.editrole.mentionable_change.add_success',r.name)).catch(err=>{
								l.reply('info.editrole.mentionable_change.add_error')
							console.error(`Se intentó poner el rol @${role.name} como mencionable, pero falló por ${err}`)});
						}
						if(action==='remove'){
							await role.setMentionable(false,reason).then(r=>l.reply('info.editrole.mentionable_change.remove_success',r.name)
							).catch(err=>{
								l.reply('info.editrole.mentionable_change.remove_success')
								console.error(`Se intentó poner el rol @${role.name} como no mencionable, pero falló por ${err}`)});
						}
						return
					default: {
						let permission: PermissionString
						for (const flag in Permissions.FLAGS) {
							if(target.toUpperCase().trim() === flag){
								if (action==='add') {
									permission = <PermissionString> flag
									const permissions = role.permissions.add(permission)
									role.setPermissions(permissions, reason).then(async ()=>{
										l.reply('info.editrole.permissions_change.add_success',role.name,
										await l.translate('permissions.' + flag));
									});
									return
								}
								if(action==='remove'){
									permission = <PermissionString> flag
									const permissions = role.permissions.remove(permission)
									role.setPermissions(permissions, reason).then(async ()=>{
										l.reply('info.editrole.permissions_change.remove_success',role.name,await l.translate('permissions.' + flag));
									});
									return
								}
							}
						}
						await msg.channel.send(`**${role.name}** sin cambios`)
					}
					return
				}
			}else{
				const value = propRegex[2].trim()
				switch (propRegex[1].trim().toLowerCase()) {
					case 'name':
						await role.setName(value,reason).then(r=>l.reply('info.editrole.name_change.add_success',role.name,r.name)).catch(err=>{
							l.reply('info.editrole.name_change.error',value)
							console.error(`Se intentó renombrar al rol @${role.name} como @${value}, pero falló por ${err}`)
						});
						return
					case 'color':
						await role.setColor(<ColorResolvable>value,reason).then(r=>l.reply('info.editrole.color_change.success',r.name,r.color.toString(16))).catch(err=>{
							l.reply('info.editrole.color_change.error',value)
							console.error(`Se intentó poner el color ${value} al rol @${role.name}, pero falló por ${err}`)
						});
						return
					case 'perms': case 'permissions':{
						const perms = parseInt(value,16)
						if(isNaN(perms)){
							l.reply('info.editrole.permissions_change.NaN')
							return
						}
						await role.setPermissions(new Permissions(BigInt(perms)),reason)
							.then(r=>l.reply('info.editrole.permissions_change.success',r.name,r.permissions.toArray().join(', ')))
							.catch(err=>{
								l.reply('info.editrole.permissions_change.error',value)
								console.error(`Se intentó poner el set de permisos ${value} al rol @${role.name}, pero falló por ${err}`)
								}
							)
						}
						return
					case 'position': case 'pos':{
						const position = parseInt(value)
						if(isNaN(position)){
							l.reply('errors.NaN',value)
							return
						}
						if (position >= botposition) {
							l.reply('info.editrole.error_highposition')
							return
						}
						await role.setPosition(position,{relative: false,reason: reason}).then(r=>l.reply('info.editrole.position_change.success',r.name,r.position.toString())).catch(err=>{
							l.reply('info.editrole.position_change.error',value)
							console.error(`Se intentó cambiar la posición a ${value} al rol @${role.name}, pero falló por ${err}`)});}
						return
					case 'above':{
						const lowerRole = RoleFinder.getRole(msg,value)
						if(!lowerRole){
							l.reply('info.editrole.position_change.invalid_lower_role')
							return
						}
						const pos_b = lowerRole.position + 1
						if (pos_b >= botposition) {
							l.reply('info.editrole.error_highposition')
							return
						}
						await role.setPosition(pos_b,{relative: false,reason: reason}).then(r=>l.reply('info.editrole.position_change.success',r.name,r.position.toString())).catch(err=>{
							l.reply('info.editrole.position_change.error',value)
							console.error(`Se intentó cambiar la posición a ${value} al rol @${role.name}, pero falló por ${err}`)});}
						return
					case 'below':{
						const higherRole = RoleFinder.getRole(msg,value)
						if (!higherRole) {
							l.reply('info.editrole.position_change.invalid_higher_role')
							return
						}
						const pos_c = higherRole.position - 1
						if (pos_c >= botposition) {
							l.reply('info.editrole.error_highposition')
						}
						await role.setPosition(pos_c,{reason: reason}).then(r=>l.reply('info.editrole.position_change.success',r.name,r.position.toString())).catch(err=>{
							l.reply('info.editrole.position_change.error',value)
							console.error(`Se intentó cambiar la posición a ${value} al rol @${role.name}, pero falló por ${err}`)});}
						return
					}
			}
		}
		//2. Si hay más variables a editar, utilizar la función de crear data
		const data = createData(l,msg,properties, role)
		if(!data){
			l.reply('info.editrole.invalid_format')
			return
		}
		if (data.name == role.name && data.position == role.position && data.color == role.color && data.permissions == role.permissions && data.hoist == role.hoist && data.mentionable == role.mentionable) {
			l.send('info.editrole.no_changes')
			return
		}
		await role.edit(data,reason).then(r=>l.send('info.editrole.success',r.name))
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.client.user) return false
		const mod = MemberFinder.getMember(msg, msg.author.id)
		const bot = MemberFinder.getMember(msg, msg.client.user.id)
		if(!mod || !bot) return false
		if (!bot.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.botperms.edit_role')
			return false
		}
		if (!mod.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.edit_role')
			return false
		}
		return true
	}
}
function createData(l:Lang,msg:Message,str:string, oldRole:Role):RoleData | undefined {
	if(!msg.client.user) return
	const bot = MemberFinder.getMember(msg, msg.client.user.id)
	if(!bot) return
	const botposition = bot.roles.highest.position
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
		if(sign === '-'){
			if(target === 'hoist') properties.set('hoist', 'false')
			if(target === 'mentionable') properties.set('mentionable', 'false')
		}
		if(sign === '+'){
			if(target === 'hoist') properties.set('hoist', 'true')
			if(target === 'mentionable') properties.set('mentionable', 'true')
		}
		if (splits.length != 2) return
			properties.set(key,splits[1].trim())
		});
	// Default Values
	const data: RoleData = {
		name: oldRole.name,
		position: oldRole.position,
		permissions: oldRole.permissions,
		color: oldRole.color,
		hoist: oldRole.hoist,
		mentionable: oldRole.mentionable
	};
	// Setting values
	for (const [key,value] of properties) {
		let perms: number
		switch (key.toLowerCase()) {
			case 'name':
				data.name = value
				break
			case 'color':
				data.color = value
				break
			case 'permissions': case 'perms':
				perms = parseInt(value,16)
				if(isNaN(perms)) data.permissions = oldRole.permissions
				else data.permissions = BigInt(perms)
			break
			case 'above': {
				const lowerRole = RoleFinder.getRole(msg,value)
				if(!lowerRole) break
				const pos = lowerRole.position + 1
				if (pos >= botposition) {
					l.send('info.editrole.warn_highposition')
					break
				}
			data.position = pos
			}
			break
			case 'below': {
				const higherRole = RoleFinder.getRole(msg,value)
				if (!higherRole) break
				const pos_c = higherRole.position - 1
				if (pos_c >= botposition) {
					l.send('info.editrole.warn_highposition')
					break
				}
			data.position = pos_c
			}
			break
			case 'position': case 'pos':
				data.position = parseInt(value)
				if (isNaN(data.position)) {
				l.reply('info.editrole.position_NaN',value)
				console.error('valor position no es un número')
				data.position = 0
			}
			break
			case 'hoist':
				if(value === 'true') data.hoist = true
				if(value === 'false') data.hoist = false
			break
			case 'mentionable':
				if(value === 'true') data.mentionable = true
				if(value === 'false') data.mentionable = false
			break
		}
	}
	return data
  }