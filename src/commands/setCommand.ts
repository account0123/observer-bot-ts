import { GuildChannel, Message, Snowflake, TextChannel } from "discord.js";
import { Connections } from "../config/connections";
import { ChannelFinder } from "../util/ChannelFinder";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";
import { LangCommand } from "./lang/langCommand";

export class SetCommand implements ArgCommand {
	requiredArgs = 2
	commandNames: string[] = ['set', 'change', 'modify']
	guildExclusive = true
	shortdescription = 'info.set.description'
	fulldescription: string = this.shortdescription
	usage = 'info.set.usage'
	examples: string[] = ['prefix <', 'logchannel logs']
	permission = 'ADMINISTRATOR'
	type = 'config'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const target = args.shift() || ''
        const value = args[0]
		const c = ChannelFinder.getChannel(msg, value)

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
					this.setLogChannel(c, value, msg, msg.guild.id, l)
				break
			default:
				break;
		}
	}
	private setLogChannel(c: GuildChannel | undefined, mention: string, msg: Message, guild_id: string, l: Lang) {
		const gc = <GuildChannel> msg.channel
		let reactable = false
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
		Connections.db.query('UPDATE guilds SET log=? WHERE id=?',[c.id, guild_id]).then(([result, fields])=>{
					console.log(JSON.stringify(result))
					console.log(JSON.stringify(fields))
					l.send('info.set.log_success', c.valueOf())
		});
	}

	private setPrefix(prefix: string, guild_id: Snowflake, l: Lang) {
		Connections.db.query('UPDATE guilds SET prefix=? WHERE id=?',[prefix, guild_id]).then(([result, fields])=>{
			console.log(JSON.stringify(result))
			console.log(JSON.stringify(fields))
			l.send('info.set.prefix_success', prefix)
		});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		if(!msg.guild) return false
		const mod = msg.guild.member(msg.author)
		if(!mod) return false
		if (!mod.hasPermission(8)) {
			l.reply('errors.modperms.admin')
			return false
		}
		return true
	}
	
}