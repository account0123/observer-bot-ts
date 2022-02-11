import ArgCommand from "./commandArgInterface";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { RoleFinder } from "../util/RoleFinder";
import { Time } from "../util/Time";
import { Lang } from "./lang/Lang";

export class RoleInfoCommand implements ArgCommand {
	requiredArgs = 1
	commandNames: string[] = ['roleinfo', 'ri']
	guildExclusive = true
	shortdescription = 'info.roleinfo.description'
	fulldescription = 'info.roleinfo.fulldescription'
	usage = 'info.roleinfo.usage'
	examples: string[] = ['123456789987654321', '@Mod', 'new role']
	permission = ''
	type = 'info'
	async run(msg: Message, l:Lang, args: string[]): Promise<void> {
		const mention = args.join(' ').trim()
		const role = RoleFinder.getRole(msg,mention)
		if (!role) {
			l.reply('errors.invalid_role',mention)
			return
		}
		const message = await msg.reply({content: '`Cargando información de ' + role.name + '...`'})
		const e = 'info.roleinfo.embed.'
		const [yes, no, title, position, hoist, mentionable, created, permissions,all,none] = await Promise.all([
			l.translate('yes'),
			l.translate('no'),
			l.translate(e+'title',role.name),
			l.translate(e+'position'),
			l.translate(e+'hoist'),
			l.translate(e+'mentionable'),
			l.translate(e+'creation'),
			l.translate(e+'permissions'),
			l.translate(e+'all'),
			l.translate(e+'none')
		]);
		const isHoist = async ()=> role.hoist ? yes : no
		const isMentionable = async ()=>role.mentionable? yes : no

		const dividePermissions = async () =>{
			if(role.permissions.bitfield == Permissions.ALL || role.permissions.bitfield == 8n) return [[all],['\u200B'],['\u200B']]
			const a = await Promise.all(role.permissions.toArray().map(s=>l.translate('permissions.'+s)))
			if(a.length === 0) return [[none],['\u200B'],['\u200B']]
			if(a.length < 13) return [a,['\u200B'],['\u200B']]
			if(a.length < 25) return [a.slice(0,12),a.slice(12),['\u200B']]
			return [a.slice(0,12),a.slice(12,24),a.slice(24)]
		};
		const permissionsvalue = await dividePermissions()
		const embed = new MessageEmbed().setTitle(title).setColor(role.color || 0)
                .addFields([
					{ name: 'ID'       , value: role.id              , inline: true},
                    { name: 'Color'    , value: role.hexColor        , inline: true},
					{ name: position   , value: String(role.position)        , inline: true},
					{ name: hoist      , value: await isHoist()      , inline: true},
					{ name: mentionable, value: await isMentionable(), inline: true},
					{ name: created    , value: new Time(role.id,l).toString()},
					{ name: `${permissions} (${role.permissions.toJSON()})`, value:permissionsvalue[0].join('\n'),inline: true},
					{ name: '\u200B'   , value: permissionsvalue[1].join('\n')  ,inline: true},
					{ name: '\u200B'   , value: permissionsvalue[2].join('\n')  ,inline: true}
                    ]).setTimestamp();
		await message.edit({content: '', embeds: [embed]})
	}
	async checkPermissions(): Promise<boolean> {
		return true
	}
	
}