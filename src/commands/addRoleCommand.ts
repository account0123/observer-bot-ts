import { CacheType, ChatInputCommandInteraction, CommandInteraction, GuildMember, Message, PermissionsBitField, Role, Snowflake, User } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import { CleanCommand } from "./cleanCommand";
import { InteractionLang, Lang } from "./lang/Lang";
import { PermissionsChecker } from "../util/PermissionsChecker";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/rest/";
import { SlashCommandBuilder } from '@discordjs/builders';
import SlashCommand from "./slashCommandInterface";

export class AddRoleCommand implements SlashCommand {
	permission = 'MANAGE_ROLES'
	shortdescription = 'info.addrole.description'
	fulldescription: string = this.shortdescription
	type = 'manage'
	async checkPermissions(msg: Message<true>,l:Lang): Promise<boolean> {
		if(!msg.client.user) return false
		const mod = MemberFinder.getMember(msg.guild, msg.author.id)
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!mod || !bot) return false
		if (!bot.permissions.has('ManageRoles')) {
			l.reply('errors.botperms.add_role')
			return false
		}
		if (!mod.permissions.has('ManageRoles')) {
			l.reply('errors.modperms.add_role')
			return false
		}
		return PermissionsChecker.check(new PermissionsBitField('SendMessages'), msg, l)
	}
	commandNames: string[] = ['addrole']
	requiredArgs = 2
	examples: string[] = ['@user#1234 1234567899878654321', '123456789987654321 @Mod']
	usage = 'info.addrole.usage'
	guildExclusive = true
	static locked_guilds: Snowflake[] = []
	async run(msg: Message<true>, l: Lang,args: string[]): Promise<void> {
		const g = msg.guild
		const membermention = args.shift() || ''
		const member = MemberFinder.getMember(g,membermention)
		if (!member) {
			l.reply('errors.invalid_member',membermention)
			return
		}
		const rolemention = args.join(' ')
		const role = RoleFinder.getRole(msg.guild,rolemention)
		if (!role) {
			l.reply('errors.invalid_role',rolemention)
			return
		}
		// Si pones !!addrole @everyone @rol  pasa esto
		if(args[0] == ('@everyone' || 'everyone')) {
			if(AddRoleCommand.locked_guilds.includes(g.id)){
				msg.react('❌').catch()
				l.send('running')
				return
			}
			
			// El bot dice "@usuario, añadiendo el rol @rol a todos"
			const s = l.send('info.addrole.massrole-start',role.name)
			s.then(m=>m.react('🔒').catch())
			const start = await s
			AddRoleCommand.locked_guilds.push(g.id)
			let count = 0
			let errors = 0
			
			const memberlist = await g.members.fetch()
			const asyncForEach = async (a:GuildMember[], callback: { (r: GuildMember): Promise<void>; (arg0: GuildMember, arg1: number, arg2: GuildMember[]): Promise<void>; }) => {
				for (let i = 0; i < a.length; i++) {
                    await new Promise<void>((res)=>setTimeout(res, 600))
                    await callback(a[i], i, a)
				}
			}
			const add = async () => {
				await asyncForEach([...memberlist.values()], async (member:GuildMember) => {
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
			AddRoleCommand.locked_guilds.splice(AddRoleCommand.locked_guilds.indexOf(g.id), 1)
			if(count==0 && errors > 5){
				// Si falla en TODOS dice
				l.send('errors.no_hit')
				// Ejecuta !!clean <cantidad de miembros>
				new CleanCommand().run(msg,l,[`${g.memberCount}`])
				// Si falla en eso dice....
				.catch(()=>l.send('errors.clean_up_failed'));
				return
			}

			l.send('info.addrole.massrole-success',role.name,'' + count).then(()=>start.delete()).then(m=>m.react('🔓').catch())
			return
		}
        
        // Verificación de rol
		if(!msg.client.user) return
        const bot = MemberFinder.getMember(g, msg.client.user.id)
		if(!bot) return
        if(role.position >= bot.roles.highest.position){
            l.reply('errors.lower_bot')
            return
        }
		await member.roles.add(role,await l.translate('reason',msg.author.tag)).then(m=>l.send('info.addrole.success',role.name,m.displayName)).catch(e=>{l.reply('info.addrole.error', role.name, member.user.username, e)
		console.error(`Se intento añadir el rol **${role.name}** a ${member.displayName} pero falló por`)
		console.error(e.stack)
		})
	}
	
	static get(): RESTPostAPIApplicationCommandsJSONBody{
		const s = new SlashCommandBuilder()
		.setName('addrole')
		.setDescription('Adds a role to a member')
		.addUserOption(option => option.setName('member').setDescription('member who will recieve a role').setRequired(true))
		.addRoleOption(option => option.setName('role').setDescription('role to be added').setRequired(true))
		return s.toJSON()
	}

	async verify(interaction: CommandInteraction<CacheType>, l: InteractionLang): Promise<boolean> {
		if(!interaction.memberPermissions || !interaction.guild) return false
		if(!interaction.memberPermissions.has('ManageRoles')){
			l.reply('errors.modperms.add_role')
			return false
		}
		const bot = interaction.guild.members.resolve(interaction.applicationId)
		if(!bot) return false
		if(!bot.permissions.has('ManageRoles')){
			l.reply('errors.botperms.add_role')
			return false
		}
		return true
	}
	async interact(interaction: ChatInputCommandInteraction, l: InteractionLang): Promise<void>{
		if(!interaction.member) return
		if(!interaction.guild){
			interaction.reply({content: await l.translate('errors.no_dms'), ephemeral: true})
			return
		}
		const user = interaction.options.getUser('member', true)
		const role = <Role>interaction.options.getRole('role')
		const target = interaction.guild.members.resolve(user)
		const mod = <User>interaction.member.user
		if(!target){
			interaction.reply({content: await l.translate('errors.invalid_member', user.tag), ephemeral: true})
			return
		}
		if(!role){
			interaction.reply({content: await l.translate('errors.invalid_role', user.tag), ephemeral: true})
			return
		}
		const m = await target.roles.add(role, await l.translate('reason',mod.tag))
		l.reply('info.addrole.success',role.name,m.user.tag)
	}
}