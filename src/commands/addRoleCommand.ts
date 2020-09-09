import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import { CleanCommand } from "./cleanCommand";
import { Lang } from "./lang/Lang";

export class AddRoleCommand implements ArgCommand {
	permission: string = 'MANAGE_ROLES'
	shortdescription: string = 'info.addrole.description'
	fulldescription: string = this.shortdescription
	async checkPermissions(msg: Message,l:Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.botperms.add_role',msg)
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.add_role',msg)
			return false
		}
		return true
	}
	commandNames: string[] = ['addrole']
	requiredArgs: number = 2
	examples: string[] = ['@user#1234 1234567899878654321', '123456789987654321 @Mod']
	usage: string = 'info.addrole.usage'
	guildExclusive: boolean = true
	async run(msg: Message, l: Lang,args: string[]): Promise<void> {
		const g = msg.guild!
		const membermention = args.shift()!
		const member = MemberFinder.getMember(msg,membermention)
		if (!member) {
			l.reply('errors.invalid_role',msg,membermention)
			return
		}
		const rolemention = args.join(' ')
		const role = RoleFinder.getRole(msg,rolemention)
		if (!role) {
			l.reply('errors.invalid_role',msg,rolemention)
			return
		}
		// Si pones !!addrole @rol @everyone pasa esto
		if(args[1] == ('@everyone' || 'everyone')) {
			// El bot dice "@usuario, añadiendo el rol @rol a todos"
			l.send('info.addrole.massrole-start',msg,role.name)
			var count = 0
			var errors = 0
			// Si falla en alguien dice "Omitiendo..."
			g.members.cache.each(m=>m.roles.add(role).then(()=>count++).catch(()=>{l.send('info.addrole.massrole-error',msg,m.user.tag);errors++}))
			if(count==0 && errors > 5){
		// Si falla en TODOS dice
				l.send('errors.no_hit',msg)
				// Ejecuta !!clean <cantidad de miembros>
				new CleanCommand().run(msg,[`${g.memberCount}`])
				// Si falla en eso dice....
				.catch(()=>l.send('errors.clean_up_failed',msg));
				return
			}
			l.send('info.addrole.massrole-success',msg,role.name,'' + count)
			return
		}
		await member.roles.add(role,l.translate('reason',msg.author.tag)).then(m=>l.send('info.addrole.success',msg,role.name,m.displayName)).catch(e=>{l.reply('info.addrole.error',msg,e)
		console.error(`Se intento añadir el rol **${role.name}** a ${member.displayName} pero falló por`)
		console.error(e.stack)
		})
	}
	
}