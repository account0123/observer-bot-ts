import { ButtonInteraction, CacheType, CommandInteraction, GuildBasedChannel, GuildChannel, Message, MessageActionRow, MessageButton, Role, Snowflake, TextChannel } from "discord.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Connections } from "../config/connections";
import { ChannelFinder } from "../util/ChannelFinder";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import ArgCommand from "./commandArgInterface";
import { InteractionLang, Lang } from "./lang/Lang";
import { LangCommand } from "./lang/langCommand";

export class SetCommand implements ArgCommand {
	requiredArgs = 1
	commandNames: string[] = ['set', 'change', 'modify']
	guildExclusive = true
	shortdescription = 'info.set.description'
	fulldescription: string = 'info.set.fulldescription'
	usage = 'info.set.usage'
	examples: string[] = ['prefix <', 'logchannel logs']
	permission = 'ADMINISTRATOR'
	type = 'config'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const target = args.shift() || ''
        const value = args[0]
		const values = args

		switch (target.toLowerCase()) {
			case 'prefix':
				if(value.length > 4){
					l.reply('errors.long_prefix')
					return
				}
				if(msg.guild)
					this.setPrefix(value, msg.guild.id, l)
				break;
			case 'lang':
				new LangCommand().run(msg, l, args)
				break
			case 'logchannel':
				if(msg.guild)
					this.setLogChannel(value, msg, msg.guild.id, l)
				break
			case 'modrole':
				if(msg.guild)
					this.addModRole(values, msg, msg.guild.id, l)
				break
			case '-': case 'removemodrole':
				if(msg.guild)
					this.removeModRole(values, msg, msg.guild.id, l)
				break
			default:
				break;
		}
	}

	private async addModRole(values: string[], msg: Message, id: string, l: Lang) {
		// Asociar value a rol objetivo
		const roles: Role[] = [];
		for (const value of values) {
			const r = RoleFinder.getRole(msg, value)
			if(r) roles.push(r)
		}
		if(roles.length == 0){
			l.reply('invalid_roles', values.join(', @'))
			return
		}
		// Verificar si mod está puesto
		const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT id, type FROM roles WHERE guild=?', [id])
		for (const role of roles) {
			const row = rows.find((row)=>row.id == role.id)
			if(row){
				if(row.type == 'admin'){
					// eliminar rol e insertar
					Connections.db.query('DELETE FROM roles WHERE id=?', role.id)
					console.log('Rol %s antes admin bajó a mod', role.name)
				}else if(row.type == 'mod'){
					// ignorar
					l.send('info.set.mod_exists')
					continue
				}	
			}
			// No está el rol en la database
			Connections.db.query('INSERT INTO roles VALUES (?, ?, ?)', [role.id, id, 'mod'])
				.then((something)=>{
					l.send('info.set.mod_success', role.name)
					console.log('Rol mod %s agregado a la database', role.name)
					console.log(something)
				}).catch((e)=>{
					console.error('Error agregando el rol como mod %s a database')
					console.error(e)
				})
		}
	}
	private async removeModRole(values: string[], msg: Message<boolean>, id: string, l: Lang) {
		if(values.length == 0){
			msg.react('❌').catch()
			return
		}
		// Asociar value a rol objetivo
		const roles: Role[] = [];
		for (const value of values) {
			const r = RoleFinder.getRole(msg, value)
			if(r) roles.push(r)
		}
		if(roles.length == 0){
			l.reply('invalid_roles', values.join(', @'))
			return
		}

		// Verificar si mod está puesto
		const [rows] = await Connections.db.execute<RowDataPacket[]>('SELECT id, type FROM roles WHERE guild=?', [id])
		for (const role of roles) {
			const row = rows.find((row)=>row.id == role.id)
			if(row){
				// eliminar rol
				Connections.db.query('DELETE FROM roles WHERE id=?', role.id)
				if(row.type == 'admin')
					console.log('Rol %s antes admin se eliminó', role.name)
				else if(row.type == 'mod')
					console.log('Rol %s se eliminó', role.name)
				l.send('info.set.mod_success', role.name)
			}
		}

	}
	private async setLogChannel(mention: string, msg: Message, guild_id: string, l: Lang) {
		const gc = <GuildChannel> msg.channel
		let reactable = false
		const confirm = new MessageButton({style: 1, customId: 'yes_delete_log', label: '✅'})
		const reject = new MessageButton({style: 1, customId: 'no_delete_log', label: '❌'})
		const action_row = new MessageActionRow({components: [confirm, reject]})
		if(!mention){
			const [rows] = await Connections.db.query<RowDataPacket[]>('SELECT log FROM guilds WHERE id=?', guild_id)
			if(rows.length > 0){
				const id = rows[0].log
				const cont = await l.translate('info.set.log_delete', (ChannelFinder.getChannel(msg, id) || '').toString(), id)
				msg.channel.send({content: cont, components: [action_row]})
			}else{
				l.send('info.set.no_log')
			}
			return
		}
		const c = ChannelFinder.getChannel(msg, mention)
		if(msg.client.user){
			const perms = gc.permissionsFor(msg.client.user)
			if(perms) reactable = perms.has('ADD_REACTIONS')
		}

		if(!c){
			l.reply('errors.invalid_channel', mention)
			if(reactable) msg.react('❌')
			return
		}
		if(!(c instanceof TextChannel)){
			l.send('errors.not_text')
			if(reactable) msg.react('❌')
			return
		}
		Connections.db.query<ResultSetHeader>('UPDATE guilds SET log=? WHERE id=?',[c.id, guild_id]).then(([result])=>{
				console.log(`Canal de registro cambiado a ${c.id}`)
				console.log(result.info)
				l.send('info.set.log_success',`<#${c.valueOf()}>`)
		});
	}

	private setPrefix(prefix: string, guild_id: Snowflake, l: Lang) {
		Connections.db.query<ResultSetHeader>('UPDATE guilds SET prefix=? WHERE id=?',[prefix, guild_id]).then(([result])=>{
			console.log(`Prefijo de ${guild_id} cambiado a ${prefix}`)
			console.log(result.info)
			l.send('info.set.prefix_success', prefix)
		});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild) return false
		const mod = MemberFinder.getMember(msg, msg.author.id)
		if(!mod) return false
		if (!mod.permissions.has(8n)) {
			l.reply('errors.modperms.admin')
			return false
		}
		return true
	}
	async react(button: ButtonInteraction, l: InteractionLang): Promise<void>{
		if(button.customId.startsWith('y')){
			const m = button.message
			// Elimina canal
			const m_ = m.content.match(/\((\d+)\)$/)
			if(!m_ || m_.length < 2) return
			const q = Connections.db.query('UPDATE guilds SET log=NULL WHERE=?', m_[1])
			q.catch((err)=>{
				if(m instanceof Message) m.delete()
				console.error(err)
			});
			if(m instanceof Message){
				m.delete()
				m.channel.send("Canal de registro ya no está asignado.")
			}
		}
		if(button.customId.startsWith('n')){
			const m = button.message
			if(m instanceof Message){
				m.delete()
				m.channel.send("No estoy para bromas.")
			}

		}
	}

}