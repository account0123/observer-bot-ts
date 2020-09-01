import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import { CleanCommand } from "./cleanCommand";
import { Lang } from "./lang/Lang";

export class AddRoleCommand implements ArgCommand {
	permission: string = 'Gestionar roles'
	shortdescription: string = 'Asigna al miembro indicado un rol.'
	fulldescription: string = this.shortdescription
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			msg.reply('no tengo el permiso para asignar roles.')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			msg.reply('no tienes permiso de asiganr roles.')
			return false
		}
		return true
	}
	commandNames: string[] = ['addrole']
	requiredArgs: number = 2
	examples: string[] = ['@usuario#1234 1234567899878654321', '123456789987654321 @Mod']
	usage: string = '<usuario> <rol>'
	guildExclusive: boolean = true
	lang:Lang
  constructor(guild_id: string){
    const lang = new Lang(guild_id)
    this.lang = lang
    this.shortdescription = this.fulldescription =  lang.translate('info.avatar.description')
  }
	async run(msg: Message, args: string[]): Promise<void> {
		const g = msg.guild!
		const role = RoleFinder.getRole(msg,args.join(' '))
		if (!role) {
			msg.reply('el rol no es válido.')
			return
		}
		// Si pones !!addrole @rol @everyone pasa esto
		if(args[1] == ('@everyone' || 'everyone')) {
			// El bot dice "@usuario, añadiendo el rol @rol a todos"
			msg.reply(`añadiendo el rol **${role.name}** a todos.`)
			var count = 0
			// Si falla en alguien dice "Omitiendo..."
			g.members.cache.each(m=>m.roles.add(role).then(()=>count++).catch(()=>msg.channel.send(`No se pudo agregar el rol a **${m.displayName}**. Omitiendo..`)))
			if(count==0){
		// Si falla en TODOS dice
				msg.channel.send('Vaya, 0 miembros... mejor limpio')
				// Ejecuta !!clean <cantidad de miembros>
				new CleanCommand().run(msg,[`${g.memberCount}`])
				// Si falla en eso dice....
				.catch(()=>msg.channel.send('Lo siento... creo que tampoco pude limpiar este desastre. Mejor usa a Chocolat o algún bot de esos.'));
			}
			msg.channel.send(`Rol **${role.name}** agregado a ${count} miembros.`)
			return
		}
		const member = MemberFinder.getMember(msg,args.shift()!)
		if (!member) {
			msg.reply('el miembro no es válido. Por si acaso el orden es `<rol> <usuario>`.')
			return
		}
		await member.roles.add(role,`Comando ejecutado por ${msg.author.tag}`).then(m=>msg.channel.send(`Rol **${role.name}** asiganado a **${m.displayName}**.`)).catch(e=>{msg.reply(`No pude añadir el rol por el error \`${e}\``)
		console.error(`Se intento añadir el rol **${role.name}** a ${member.displayName} pero falló por`)
		console.error()
		})
	}
	
}