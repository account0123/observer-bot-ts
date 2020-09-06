import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { RoleFinder } from "../util/RoleFinder";
import { Time } from "../util/Time";

export class RoleInfoCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['roleinfo', 'ri']
	guildExclusive: boolean = true
	shortdescription: string = 'info.roleinfo.description'
	fulldescription: string = ''
	usage: string = 'info.roleinfo.usage'
	examples: string[] = ['123456789987654321', '@Mod', 'new role']
	permission: string = ''
	async run(msg: Message, args: string[]): Promise<void> {
		const mention = args.join(' ').trim()
		const role = RoleFinder.getRole(msg,mention)
		if (!role) {
			msg.reply(`no pude encontrar el rol ${mention}`)
			return
		}
		const embed = new MessageEmbed().setTitle(`Detalles de ${role.id}:`).setColor(role.color || 0)
                .addFields(
					{ name: 'Nombre:'  , value: role.name,     inline: true},
                    { name: 'Color:'   , value: role.hexColor, inline: true},
					{ name: 'Posición' , value: role.position, inline: true},
					{ name: 'Creado el', value: new Time(role.id).toString()},
					{ name: 'Permisos:', value: role.permissions.toJSON()}
                    )
				.setTimestamp();
		await msg.channel.send(embed).catch(e=>console.error(e.stack))
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		return true
	}
	
}