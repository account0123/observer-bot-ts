import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import { Lang } from "./lang/Lang";

export class RemoveRoleCommand implements ArgCommand {
	permission: string = 'MANAGE_ROLES'
	shortdescription: string = 'info.removerole.description'
	fulldescription: string = this.shortdescription
	commandNames: string[] = ['remrole','removerole'];
	requiredArgs: number = 2
	examples: string[] = ['123456789987654321 @Mods', '@usuario#1234 trial admin'];
	usage: string = 'info.removerole.usage'
	guildExclusive: boolean = true
	async run(msg: Message, args: string[]): Promise<void> {
		const member = MemberFinder.getMember(msg,args.shift()!)
		const role = RoleFinder.getRole(msg,args.join(' '))
		if (!member) {
			msg.reply('el miembro no es válido. Por si acaso el orden es `<usuario> <rol>`.')
			return
		}
		if (!role) {
			msg.reply('el rol no es válido')
			return
		}
		await member.roles.remove(role,`Comando ejecutado por ${msg.author.tag}`).then(m=>msg.channel.send(`Rol **${role.name}** removido a **${m.displayName}**.`)).catch(e=>{msg.reply(`No pude quitar el rol por el error \`${e}\``)
		console.error(`Se intento eliminar el rol **${role.name}** a ${member.displayName} pero falló por`)
		console.error(e.stack)
		})
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.botperms.remove_role',msg)
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			l.reply('errors.modperms.remove_role',msg)
			return false
		}
		return true
	}
}