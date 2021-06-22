import ArgCommand from "./commandArgInterface";
import { GuildMember, Message, Permissions } from "discord.js";
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
			l.reply('errors.botperms.add_role')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.add_role')
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
			l.reply('errors.invalid_member',membermention)
			return
		}
		const rolemention = args.join(' ')
		const role = RoleFinder.getRole(msg,rolemention)
		if (!role) {
			l.reply('errors.invalid_role',rolemention)
			return
		}
		// Si pones !!addrole @rol @everyone pasa esto
		if(args[1] == ('@everyone' || 'everyone')) {
			// El bot dice "@usuario, añadiendo el rol @rol a todos"
			l.send('info.addrole.massrole-start',role.name)
			var count = 0
			var errors = 0
			
			const memberlist = await g.members.fetch()
			const asyncForEach = async (a:GuildMember[], callback: { (r: GuildMember): Promise<void>; (arg0: GuildMember, arg1: number, 	arg2: GuildMember[]): any; }) => {
				for (let i = 0; i < a.length; i++) {
				  await callback(a[i], i, a)
				}
		  	}
			const add = async () => {
				await asyncForEach(memberlist.array(), async (member:GuildMember) => {
					await member.roles.add(role)
						.then(()=>count++)
						.catch(e=>{
							// Si falla en alguien dice "Omitiendo..."
							l.send('info.addrole.massrole-error', member.user.tag)
							console.error(e.stack)
							errors++
						})
				});
			}

			await add()
			 
			if(count==0 && errors > 5){
				// Si falla en TODOS dice
				l.send('errors.no_hit')
				// Ejecuta !!clean <cantidad de miembros>
				new CleanCommand().run(msg,l,[`${g.memberCount}`])
				// Si falla en eso dice....
				.catch(()=>l.send('errors.clean_up_failed'));
				return
			}

			l.send('info.addrole.massrole-success',role.name,'' + count)
			return
		}
        
        // Verificación de rol
        const bot = msg.guild!.member(msg.client.user!)!
        if(role.position >= bot.roles.highest.position){
            l.reply('errors.lower_bot')
            return
        }
		await member.roles.add(role,await l.translate('reason',msg.author.tag)).then(m=>l.send('info.addrole.success',role.name,m.displayName)).catch(e=>{l.reply('info.addrole.error', role.name, member.user.username, e)
		console.error(`Se intento añadir el rol **${role.name}** a ${member.displayName} pero falló por`)
		console.error(e.stack)
		})
	}
	
}