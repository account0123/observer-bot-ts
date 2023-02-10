import { ChannelType, ChatInputCommandInteraction, Message, PermissionsBitField, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { Lang } from "./lang/Lang";
import { ChannelFinder } from "../util/ChannelFinder";
import { MemberFinder } from "../util/MemberFinder";
import { SlashCommandBuilder } from '@discordjs/builders';
import SlashCommand from "./slashCommandInterface";
import { PermissionsChecker } from "../util/PermissionsChecker";

export class SayCommand implements SlashCommand {
	type: string | undefined;
	permission = ''
	shortdescription = 'info.say.description'
	fulldescription: string = this.shortdescription
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		return PermissionsChecker.check(new PermissionsBitField('ManageMessages'), msg, l)
	}
	commandNames: string[] = ['say', 'tell', 'speak']
	requiredArgs = 1
	examples: string[] = ['Hello world!!!','Hay pelotudos y luego estás tú']
	usage = 'info.say.usage'
	guildExclusive = false
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const text = args.join(' ')
		const regex = /to ([\w]+)$/m
		const m = text.match(regex)
		if(m && msg.guild && msg.client.user){
			const bot = MemberFinder.getMember(msg.guild, msg.client.user.id)
			if(!bot) return
			const channel = ChannelFinder.getChannel(msg, m[1])
			if(!channel) return
			const p = channel.permissionsFor(bot)
			if(channel.type === ChannelType.GuildText && p.has('SendMessages')){
				const c = channel
				await c.send({content: text.replace(regex,''), allowedMentions: {parse: ['users', 'roles']}})
				return
			}
		}
		await msg.channel.send(text)
		setTimeout(()=>msg.delete(), 200)
	}

	static get(): RESTPostAPIChatInputApplicationCommandsJSONBody{
		const s = new SlashCommandBuilder()
		.setName('say')
		.setDescription('I say whatever you want')
		.addStringOption(option => option.setName('words').setDescription('Words you want I say').setRequired(true))
		return s.toJSON()
	}

	verify(): Promise<boolean> {
		return Promise.resolve(true)
	}
	
	async interact(interaction: ChatInputCommandInteraction): Promise<void>{
		const words = interaction.options.getString('words', true)
		interaction.reply(words)
		return
	}
}