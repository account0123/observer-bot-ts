import { CommandInteraction, Message, TextChannel } from "discord.js";
import { Lang } from "./lang/Lang";
import { ChannelFinder } from "../util/ChannelFinder";
import { MemberFinder } from "../util/MemberFinder";
import { SlashCommandBuilder } from '@discordjs/builders';
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/rest/v9/interactions";
import SlashCommand from "./slashCommandInterface";

export class SayCommand implements SlashCommand {
	type: string | undefined;
	permission = ''
	shortdescription = 'info.say.description'
	fulldescription: string = this.shortdescription
	async checkPermissions(): Promise<boolean> {
		return true
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
			const bot = MemberFinder.getMember(msg, msg.client.user.id)
			if(!bot) return
			const channel = ChannelFinder.getChannel(msg, m[1])
			if(!channel) return
			const p = channel.permissionsFor(bot)
			if(channel.type === 'GUILD_TEXT' && p.has('SEND_MESSAGES')){
				const c = <TextChannel>channel
				await c.send({content: text.replace(regex,''), allowedMentions: {parse: ['users', 'roles']}})
				return
			}
		}
		await msg.channel.send(text)
		setTimeout(msg.delete, 200)
	}

	static get(): RESTPostAPIApplicationCommandsJSONBody{
		const s = new SlashCommandBuilder()
		.setName('say')
		.setDescription('I say whatever you want')
		.addStringOption(option => option.setName('words').setDescription('Words you want I say').setRequired(true))
		return s.toJSON()
	}

	verify(): Promise<boolean> {
		return Promise.resolve(true)
	}
	
	async interact(interaction: CommandInteraction): Promise<void>{
		const words = interaction.options.getString('words', true)
		return interaction.reply(words);
	}
}