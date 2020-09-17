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
		const loading = msg.channel.send('`Cargando información de ' + role.name + '...`')
		const isHoist = async ()=> role.hoist ? await l.translate('yes') : await l.translate('no')
		const isMentionable = async ()=>role.mentionable?await l.translate('yes'):await l.translate('no')
		const e = 'info.roleinfo.embed.'

		const dividePermissions = async () =>{
			const a = await Promise.all(role.permissions.toArray().map(s=>l.translate('permissions.'+s)))
			if(a.length < 12) return [a,['\u200B'],['\u200B']]
			if(a.length < 23) return [a.slice(0,11),a.slice(11),['\u200B']]
			return [a.slice(0,11),a.slice(11,22),a.slice(22)]
		};
		const permissions = await dividePermissions()
		const embed = new MessageEmbed().setTitle(await l.translate(e+'title',role.name)).setColor(role.color || 0)
                .addFields(
					{ name: 'ID'   , value: role.id      , inline: true},
                    { name: 'Color', value: role.hexColor, inline: true},
					{ name: await l.translate(e+'position')   , value: role.position, inline: true},
					{ name: await l.translate(e+'hoist')      , value: await isHoist(), inline: true},
					{ name: await l.translate(e+'mentionable'), value: await isMentionable() , inline: true},
					{ name: await l.translate(e+'creation')   , value: new Time(role.id,l).toString()},
					{ name: `${await l.translate(e+'permissions')} (${role.permissions.toJSON().toString(16)})`, value:permissions[0],inline: true},
					{name: '\u200B', value: permissions[1],inline: true},
					{name: '\u200B', value: permissions[2],inline: true}
                    ).setTimestamp();
		await msg.channel.send(embed).then(()=>loading.then(m=>m.delete())).catch(e=>console.error(e.stack))
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
	
}