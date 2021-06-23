import { Message, Snowflake } from "discord.js";
import { Connections } from "../config/connections";
import ArgCommand from "./commandArgInterface";
import { Lang } from "./lang/Lang";
import { LangCommand } from "./lang/langCommand";

export class SetCommand implements ArgCommand {
	requiredArgs: number = 2
	commandNames: string[] = ['set', 'change', 'modify']
	guildExclusive: boolean = true
	shortdescription: string = 'info.set.description'
	fulldescription: string = this.shortdescription
	usage: string = 'info.set.usage'
	examples: string[] = ['set prefix <']
	permission: string = 'ADMINISTRATOR'
	type = 'config'
	async run(msg: Message, l: Lang, args: string[]): Promise<void> {
		const target = args.shift()!
        const value = args[0]
		switch (target.toLowerCase()) {
			case 'prefix':
				if(value.length > 4){
					l.reply('errors.long_prefix')
					return
				}
				this.setPrefix(value, msg.guild!.id, l)
				break;
			case 'lang':
				new LangCommand().run(msg, l, args)
				break
			default:
				break;
		}
	}
	private setPrefix(prefix: string, guild_id: Snowflake, l: Lang) {
		Connections.db.query('UPDATE guilds SET prefix=? WHERE id=?',[prefix, guild_id]).then(([result, fields])=>{
			console.log(JSON.stringify(result))
			console.log(JSON.stringify(fields))
			l.send('info.set.prefix_success', prefix)
		});
	}
	async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		if (!mod.hasPermission(8)) {
			l.reply('errors.modperms.admin')
			return false
		}
		return true
	}
	
}