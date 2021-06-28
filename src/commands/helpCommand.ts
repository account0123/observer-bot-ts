import ArgCommand from "./commandArgInterface";
import { CollectorFilter, Message, MessageEmbed, MessageReaction, Permissions, ReactionCollector, User } from "discord.js";
import CommandHandler from "../commandHandler";
import { Lang } from "./lang/Lang";
import Command from "./commandInterface";
import { PermissionsChecker } from "../util/PermissionsChecker";

type BotCommand = {
	name: string
	summary: string
}
export class HelpCommand implements ArgCommand {
	type: string | undefined;
	permission: string = ''
	shortdescription: string = 'info.help.description'
	fulldescription: string = 'info.help.fulldescription'
	commandNames: string[] = ['help', 'h']
	requiredArgs: number = 0
	examples: string[] = ['', 'createrole']
	usage: string = 'info.help.usage'
	guildExclusive: boolean = false
	lang: Lang | undefined
	prefix: string | undefined
	msg: Message | undefined
	async run(msg: Message,l: Lang, args: string[], prefix: string): Promise<void> {
		this.lang = l
		this.prefix = prefix
		this.msg = msg
		if (args.length > 0) this.createHelpEmbed(args[0])
		else this.createCommandList()
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(msg.channel.type == 'dm') return true
		return PermissionsChecker.check(new Permissions(['SEND_MESSAGES', 'ADD_REACTIONS']), msg, l)
	}
	private async createCommandList() {
		if(!this.lang || !this.prefix || !this.msg) return
		const l = this.lang, t = 'categories.', [manage, info, misc, mod, config] = await Promise.all([l.translate(t+'manage'), l.translate(t+'info'),l.translate(t+'misc'), l.translate(t+'mod'), l.translate(t+'config')])
		const managers: BotCommand[] = [], informers: BotCommand[] = [], random: BotCommand[] = [],  
		moderators: BotCommand[] = [], configurators: BotCommand[] = []
		// separates commands by their type
		const divideList = async (c:Command | ArgCommand) => {
			const o = {name: c.commandNames[0], summary: c.shortdescription}
			if(!c.type){
				random.push(o)
				return
			}
			switch(c.type){
				case 'info': informers.push(o); break;
				case 'manage': managers.push(o); break;
				case 'mod': moderators.push(o); break;
				case 'config': configurators.push(o)
			}
		};
		CommandHandler.argCommands.forEach(c=>divideList(c))
		CommandHandler.commands.forEach(c=>divideList(c))

		// creates embed.description (all commands list)
		const createList = async (commands: BotCommand[]) =>{
			const a: string[] = []
			for await (const c of commands) {
				const description = await l.translate(c.summary);
				a.push(`\`${c.name}\` - ${description}`)
			}
			return a
		}
		
		// Building an embed page
		const title = await l.translate('info.help.general.title')
		const footer = await l.translate('info.help.general.footer', '1', '3', this.prefix)
		const embed = new MessageEmbed().setTitle(title).setFooter(footer).setTimestamp();
		const bot = this.msg.client.user!
		if(this.msg.guild) embed.setColor(this.msg.guild.member(bot)!.displayColor)
		else embed.setColor(0xffffff)
		embed.setAuthor(bot.tag,bot.avatarURL({dynamic:true})!)
		// copy
		const embed2 = new MessageEmbed(embed)
		const embed3 = new MessageEmbed(embed)
		// Field to embed 1
		embed.addField(mod, await createList(moderators))

		// Fiels to embed 2
		embed2.addFields(
			{name: manage, value: await createList(managers)},
			{name: info, value: await createList(informers)}
		);
		// Fields to embed 3
		embed3.addFields(
			{name: config, value: await createList(configurators)},
			{name: misc, value: await createList(random)}
		);
		// Creating message components
		/** 
		const prev_button = {
			type: 2,
			style: 2,
			label: "<",
			custom_id: "previous",
			disabled: true
		};
		const next_button = {
			type: 2,
			style: 1,
			label: ">",
			custom_id: "next"
		};
		const row = {
			type: 1,
			components: [prev_button, next_button]
		}
		*/
		// Sending embed page + reactions
		
		this.msg.channel.send(embed).then((msg)=>{
			const pages = 3
			let page = 1
			try{
			await msg.react('⬅️');await msg.react('➡️')
			const f: CollectorFilter = (reaction: MessageReaction, user: User) => {
				if((reaction.emoji.name === '➡️' || reaction.emoji.name === '⬅️') && user.id == this.msg!.author.id) return true
				else return false
			};
			const loadPage = async (p: number)=>{
				let e: MessageEmbed = new MessageEmbed()
				switch(p){
					case 1: e = embed; break;
					case 2: e = embed2; break;
					case 3: e = embed3
				}
				e.setFooter(await l.translate('info.help.general.footer', `${p}`, `${pages}`, `${this.prefix}`))
				msg.edit(e);
			};
			const rc = new ReactionCollector(msg, f, {idle: 120000})
			
			rc.on('collect', async (reaction, user)=>{
				if(!f(reaction, user)) return
				if(reaction.emoji.name == '➡️'){
					reaction.remove(); if(page==pages) return;page++;
					loadPage(page)
				}

				if(reaction.emoji.name === '⬅️'){
reaction.remove();if(page==1) return;page--;
					loadPage(page)
				}
			});
			rc.once('end', ()=>{
				if(this.msg.guild.member(bot)!.hasPermission("MANAGE_MESSAGES")) msg.reactions.removeAll()
			});
			}catch(error){
				const p = PermissionsChecker.check(new Permissions(['SEND_MESSAGES', 'ADD_REACTIONS', 'MANAGE_MESSAGES']), this.msg!, this.lang!)
				p.then((c)=>{if(c) console.error(error)}).catch(err=>console.error(err))
			}
			console.log('Embed de ayuda enviado')
		})
	}

	private async createHelpEmbed(commandName:string) {
		if(!this.lang || !this.msg) return
		const l = this.lang
		const command = CommandHandler.commands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const argCommand = CommandHandler.argCommands.find(command => command.commandNames.includes(commandName.toLowerCase()))
		const about = 'info.help.about.'
		let embed
		if (command) {
			embed = new MessageEmbed().setTitle(await l.translate(about + 'title',command.commandNames.shift()!))
			.setDescription(await l.translate(command.fulldescription))
			.addField(await l.translate(about + 'aliases'),command.commandNames.join(', '),true)
			.addField(await l.translate(about + 'usage'),await l.translate('info.help.default.no_usage'),true)
			.setTimestamp();
		}
		if (argCommand) {
			const droute = 'info.help.default.'
			const buildField = async () => {
				switch (argCommand.permission) {
					case '':
						return await l.translate(droute + 'no_permissions')
					case 'Administrador':
						return await l.translate(droute + 'admin_exclusive')
					default:
						return await l.translate(droute + 'permission_or_admin',await l.translate('permissions.' + argCommand.permission))
				}
			}
			const name = argCommand.commandNames.shift()!
			embed = new MessageEmbed().setTitle(await l.translate(about + 'title',name)).setDescription(await l.translate(argCommand.fulldescription,Permissions.DEFAULT.toString(16)))
			if(argCommand.commandNames.length > 0) embed.addField(await l.translate(about + 'aliases'),argCommand.commandNames.join(', '),true)
			embed.addField(await l.translate(about + 'usage'),`${this.prefix}${name} \`${await l.translate(argCommand.usage)}\``,true)
			.addField(await l.translate(about + 'required'),await buildField(),true)
			.addField(await l.translate(about + 'examples'),argCommand.examples.map(e=>`${this.prefix}${name} ${e}\n`))
			.setFooter(await l.translate(about + 'footer'))
			.setTimestamp();
		}
		if(!embed){
            this.msg.react('❌')
            l.send('info.help.not_found', commandName)
            return
        }
		const bot = this.msg.client.user!
		if(this.msg.guild) embed.setColor(this.msg.guild!.member(bot)!.displayColor)
		else embed.setColor(0xffffff)
		this.msg.channel.send(embed.setAuthor(bot.tag,bot.avatarURL({dynamic:true})!))
		.then(()=>console.log('Embed de ayuda enviado')).catch(e=>{
			const p = PermissionsChecker.check(new Permissions(['SEND_MESSAGES']), this.msg!, this.lang!)
			p.then((c)=>{if(c) console.error(e)}).catch(err=>console.error(err))
		});
	}
}
