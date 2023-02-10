import { ChatInputCommandInteraction, CommandInteraction, Message, RESTPostAPIApplicationCommandsJSONBody, Role, SlashCommandBuilder, User } from "discord.js";
import { MemberFinder } from "../util/MemberFinder";
import { RoleFinder } from "../util/RoleFinder";
import { InteractionLang, Lang } from "./lang/Lang";
import SlashCommand from "./slashCommandInterface";

export class RemoveRoleCommand implements SlashCommand {
	
	permission = 'MANAGE_ROLES'
	shortdescription = 'info.removerole.description'
	fulldescription: string = this.shortdescription
	commandNames: string[] = ['remrole','removerole'];
	requiredArgs = 2
	examples: string[] = ['123456789987654321 @Mods', '@usuario#1234 trial admin'];
	usage = 'info.removerole.usage'
	guildExclusive = true
	type = 'manage'
	async run(msg: Message<true>, l:Lang, args: string[]): Promise<void> {
		const mention = args.shift() || ''
		const member = MemberFinder.getMember(msg.guild,mention)
		const role = RoleFinder.getRole(msg.guild,args.join(' '))
		if (!member) {
			l.reply('errors.invalid_member',mention)
			return
		}
		if (!role) {
			l.reply('errors.invalid_role',args.join(' '))
			return
		}
		await member.roles.remove(role,await l.translate('reason',msg.author.tag)).then(()=>l.send('info.removerole.success',role.name,member.displayName)).catch(e=>{
		l.reply('info.removerole.error',e)
		console.error(`Se intento eliminar el rol **${role.name}** a ${member.displayName} pero falló por`)
		console.error(e.stack)
		})
	}
	async checkPermissions(msg: Message<true>, l: Lang): Promise<boolean> {
		if(!msg.client.user) return false
		const mod = MemberFinder.getMember(msg.guild, msg.author.id)
		const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
		if(!mod || !bot) return false
		if (!bot.permissions.has('ManageRoles')) {
			l.reply('errors.botperms.remove_role')
			return false
		}
		if (!mod.permissions.has('ManageRoles')) {
			l.reply('errors.modperms.remove_role')
			return false
		}
		return true
	}
	async verify(interaction: CommandInteraction, l: InteractionLang): Promise<boolean> {
		if(!interaction.memberPermissions || !interaction.guild) return false
		if(!interaction.memberPermissions.has('ManageRoles')){
			l.reply('errors.modperms.remove_role')
			return false
		}
		const bot = interaction.guild.members.resolve(interaction.applicationId)
		if(!bot) return false
		if(!bot.permissions.has('ManageRoles')){
			l.reply('errors.botperms.remove_role')
			return false
		}
		return true
	}
	static get(): RESTPostAPIApplicationCommandsJSONBody{
		const s = new SlashCommandBuilder()
		.setName('removerole')
		.setDescription('Removes a role to a member')
		.addUserOption(option => option.setName('member').setDescription('member whose role is removed').setRequired(true))
		.addRoleOption(option => option.setName('role').setDescription('role to be removed').setRequired(true))
		return s.toJSON()
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
		await interaction.deferReply()
		if(!target){
			interaction.editReply({content: await l.translate('errors.invalid_member', user.tag)})
			return
		}
		if(!role){
			interaction.editReply({content: await l.translate('errors.invalid_role', user.tag)})
			return
		}
		const m = await target.roles.remove(role,await l.translate('reason',mod.tag))
		l.edit('info.removerole.success',role.name,m.user.tag)
	}
}