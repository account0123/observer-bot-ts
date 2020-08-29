import ArgCommand from "./commandArgInterface";
import { Message } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";

export class AddRoleCommand implements ArgCommand {
	commandNames: string[] = ['addrole']
	requiredArgs: number = 2
	examples: string[] = ['@usuario#1234 1234567899878654321', '123456789987654321 @Mod']
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
			msg.reply('no puedo agregar roles al miembro porque me faltan permisos o está más alto que yo')
			return
		}
		await member.roles.add(role,`Comando ejecutado por ${msg.author.tag}`).then(m=>msg.channel.send(`Rol **${role.name}** asiganado a **${m.displayName}**.`)).catch(e=>{msg.reply(`No pude añadir el rol por el error \`${e}\``)
		console.error(`Se intento añadir el rol **${role.name}** a ${member.displayName} pero falló por`)
		console.error(e)
		}
		)
	}
	
}