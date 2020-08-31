import ArgCommand from "./commandArgInterface";
import { Message, Permissions } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";

export class DemoteCommand implements ArgCommand {
	permission: string = 'Gestionar roles'
	shortdescription: string = 'Degrada al miembro indicado.'
	fulldescription: string = this.shortdescription
	commandNames: string[] = ['demote']
	requiredArgs: number = 1
	examples: string[] = ['@usuario#1234 abuso de poder']
	usage: string = '<usuario> [razón]'
	guildExclusive: boolean = true
	async run(msg: Message, args: string[]): Promise<void> {
		const member = MemberFinder.getMember(msg,args.shift()!)
		const mod = msg.guild!.member(msg.author)!
		if(!member){
			msg.reply('el usuario no es válido')
			return
		}
		if(!member.manageable){
			msg.reply('no puedo agregar roles al miembro porque está más alto que yo')
			return
		}
		const role = member.roles.highest
		if(!(mod.roles.highest.position > role.position)){
			msg.reply('no puedes degradar a un compañero o superior, que malo.')
			return
		}
		await member.roles.remove(role,args.join(' ') || `Comando ejecutado por ${msg.author.tag}`).then(m=>msg.channel.send(`Rol **${role.name}** removido a **${m.displayName}**. Ahora es **${m.roles.highest.name}**`)).catch(e=>{msg.reply(`No pude quitar el rol por el error \`${e}\``)
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