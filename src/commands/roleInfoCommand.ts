import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { RoleFinder } from "../util/RoleFinder";
import { Time } from "../util/Time";
import { Lang } from "./lang/Lang";

export class RoleInfoCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['roleinfo', 'ri']
	guildExclusive: boolean = true
	shortdescription: string = 'info.roleinfo.description'
	fulldescription: string = 'info.roleinfo.fulldescription'
	usage: string = 'info.roleinfo.usage'
	examples: string[] = ['123456789987654321', '@Mod', 'new role']
	permission: string = ''
	async run(msg: Message, l:Lang, args: string[]): Promise<void> {
		const mention = args.join(' ').trim()
		const role = RoleFinder.getRole(msg,mention)
		if (!role) {
			l.reply('errors.invalid_role',mention)
			return
		}
		const isHoist = async ()=> role.hoist ? await l.translate('yes') : await l.translate('no')
		const isMentionable = async ()=>role.mentionable?await l.translate('yes'):await l.translate('no')
		const e = 'info.roleinfo.embed.'
		const embed = new MessageEmbed().setTitle(await l.translate(e+'title',role.name)).setColor(role.color || 0)
                .addFields(
					{ name: await l.translate(e+'name')       , value: role.name,     inline: true},
                    { name: 'Color'      , value: role.hexColor, inline: true},
					{ name: await l.translate(e+'position')   , value: role.position, inline: true},
					{ name: await l.translate(e+'hoist')      , value: await isHoist(), inline: true},
					{ name: await l.translate(e+'mentionable'), value: await isMentionable() , inline: true},
					{ name: await l.translate(e+'creation')   , value: new Time(role.id,l).toString()},
					{ name: await l.translate(e+'permissions'), value: role.permissions.toJSON()}
                    )
				.setTimestamp();
		await msg.channel.send(embed).catch(e=>console.error(e.stack))
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		return true
	}
	
}