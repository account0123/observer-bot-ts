import { Message, Permissions, MessageEmbed, GuildCreateChannelOptions } from "discord.js";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";

export class CreateChannelCommand implements ArgCommand{
	permission: string = 'MANAGE_CHANNELS'
	shortdescription: string = 'info.createchannel.description'
	fulldescription: string = 'info.createchannel.fulldescription';
	commandNames: string[] = ['createchannel', 'cc']
	requiredArgs: number = 2
	examples: string[] = ['text gaming-chat {topic:Channel for all gamers}', 'text booster-channel allow-roles {server booster:view_channel} deny-roles {everyone:view_channel}', 'text John\'s-channel allow-users {John:{send_messages,manage_channel,manage_webhooks}} deny-roles {everyone:send_messages}', 'text hentai {nsfw}','category bots {position:4}']
	usage:string = 'info.createchannel.usage'
	guildExclusive: boolean = true
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		// nuevo código
		const first_arg = args.shift()!.toLowerCase()
		let type: GuildCreateChannelOptions["type"]
		switch (first_arg) {
			case 'text': case 'voice': case 'news': case 'store': case 'category':
				type = first_arg
				break;
			default:
				l.send('errors.invalid_type',first_arg)
				return
		}
		const name = args.shift()!
		const arg = args.join(' ')
		const no_cat = await l.translate('info.createchannel.embed.no_category')
		let data: GuildCreateChannelOptions | undefined
		if(arg) data = createData(arg)
		if (!data) {
			msg.guild!.channels.create(name, {type: type}).then(async (channel) => {
				const e = 'info.createchannel.embed.'
				const getCategory = ()=>{
					if(channel.parent) return channel.parent.name
					else return no_cat
				};
				const embed = new MessageEmbed().setTitle(l.translate(e+'title')).setColor(0)
				.addFields(
					{ name: await l.translate(e+'name'), value: channel.name, inline: true},
					{ name: await l.translate(e+'position'), value: channel.calculatedPosition, inline: true},
					{ name: await l.translate(e+'category'), value: getCategory(), inline: true},
					{ name: await l.translate(e+'allowed'), value: channel.permissionOverwrites.mapValues((o)=>o.allow.bitfield.toString(16)), inline: true},
					{ name: await l.translate(e+'denied'), value: channel.permissionOverwrites.mapValues((o)=>o.deny.bitfield.toString(16)), inline: true}
				).setTimestamp();
				l.reply('info.createchannel.success',channel.toString())
				msg.channel.send(embed)
				return
			}).catch( (error) => {
				if(error.code === 30013) l.send('info.createchannel.30013')
				else l.reply('errors.unknown')
				console.error(error)
			});
		}
		// Ejecución
		data!.type = type
        msg.guild!.channels.create(name,data!).then(async (channel) => {
			const e = 'info.createchannel.embed.'
			const getCategory = ()=>{
				if(channel.parent) return channel.parent.name
				else return no_cat
			};
			const embed = new MessageEmbed().setTitle(l.translate(e+'title')).setColor(0)
			.addFields(
				{ name: await l.translate(e+'name'), value: channel.name, inline: true},
				{ name: await l.translate(e+'position'), value: channel.calculatedPosition, inline: true},
				{ name: await l.translate(e+'category'), value: getCategory(), inline: true},
				{ name: await l.translate(e+'allowed'), value: channel.permissionOverwrites.mapValues((o)=>o.allow.bitfield.toString(16)), inline: true},
				{ name: await l.translate(e+'denied'), value: channel.permissionOverwrites.mapValues((o)=>o.deny.bitfield.toString(16)), inline: true}
			).setTimestamp();
			l.reply('info.createchannel.success',channel.toString())
			msg.channel.send(embed)
			return
		}).catch( (error) => {
			if(error.code === 30013) l.send('info.createchannel.30013')
			else l.reply('errors.unknown')
			console.error(error)
		});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			l.reply('errors.botperms.create_channel')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
			l.reply('errors.modperms.create_channel')
			return false
		}
		return true
	}
}

function createData(str:string): GuildCreateChannelOptions | undefined {
	if(str === '') return undefined 
	const body = str.slice(1,-1)
	if(!body || body.length < 6) return undefined
	const map = body.split(',')
	const properties = new Map()
	map.forEach(s=>{
	  const splits = s.trim().split(':')
	  const key = splits[0].trim()
	  if(key == 'nsfw') splits[1] = 'true'
	  if (splits.length != 2) return
	  properties.set(key,splits[1].trim())
	});
	// Default Values
	var data: GuildCreateChannelOptions = {
	  topic: '',
	  position: 0,
	  nsfw: false
	};
	// Setting values
	for (const [key,value] of properties) {
	  switch (key.toLowerCase()) {
	  case 'position': case 'pos':
		data.position = parseInt(value)
		if (isNaN(data.position)) {
			console.error('valor position ('+value+') no es un número')
			data.position = 0
		}
		break
	  case 'topic':
		  data.topic = value
		  break
	  case 'nsfw':
		  if(value == 'true') data.nsfw =true
		} 
	}
	return data
  }