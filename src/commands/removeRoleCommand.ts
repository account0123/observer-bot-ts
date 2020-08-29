import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";

export class RemoveRoleCommand implements ArgCommand {
	commandNames: string[] = ['remrole','removerole'];
	requiredArgs: number = 2
	examples: string[] = ['123456789987654321 @Mods', '@usuario#1234 admin de prueba'];
	usage: string = '<usuario> <rol>'
	guildExclusive: boolean = true
	async run(msg: Message, args: string[]): Promise<void> {
		const member = MemberFinder.getMember(msg,args.shift()!)
		const role = RoleFinder.getRole(msg,args.join(' '))
		if (!member) {
			msg.reply('el miembro no es válido')
			return
		}
		if (!role) {
			msg.reply('el rol no es válido')
			return
		}
		if(!member.manageable){
			msg.reply('no puedo agregar roles al miembro porque está más alto que yo')
			return
		}
		await member.roles.remove(role,`Comando ejecutado por ${msg.author.tag}`).then(m=>msg.channel.send(`Rol **${role.name}** removido a **${m.displayName}**.`)).catch(e=>{msg.reply(`No pude quitar el rol por el error \`${e}\``)
		console.error(`Se intento eliminar el rol **${role.name}** a ${member.displayName} pero falló por`)
		console.error()
		})
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			msg.reply('no tengo el permiso para desasignar roles.')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			msg.reply('no tienes permiso de desasignar roles.')
			return false
		}
		return true
	}
}