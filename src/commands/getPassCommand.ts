import { Message, Snowflake } from "discord.js";
import {utils, ModeOfOperation} from 'aes-js'
import ArgCommand from "./commandArgInterface";
import { UserFinder } from "../util/UserFinder";
import { Lang } from "./lang/Lang";
import { MemberFinder } from "../util/MemberFinder";

export class GetPassCommand implements ArgCommand {
	permission = 'ADMINISTRATOR'
	requiredArgs = 0
	usage = 'info.getpass.usage'
	examples: string[] = ['','123456789987654321', '@usuario#1234']
	commandNames: string[] = ['getpass', 'getpassword','getsecret']
	guildExclusive = true
	shortdescription = 'info.getpass.description'
	fulldescription = 'info.getpass.fulldescription'
	type = 'manage'
	static readonly key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]
	static readonly iv = [ 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,115, 116 ]
	static validatePassword(author_id: Snowflake, guild_id: Snowflake, l: Lang, input: string): boolean{
		if(input.length != 32){
			l.reply('errors.short_password')
			return false
		}
		const encryptedBytes = utils.hex.toBytes(input)
		for (const byte of encryptedBytes) {
			if(isNaN(byte)){
				l.reply('errors.invalid_password')
				return false
			}
		}
		const aesCbc = new ModeOfOperation.cbc(GetPassCommand.key,GetPassCommand.iv)
		const decryptedBytes = aesCbc.decrypt(encryptedBytes)
		const key = utils.utf8.fromBytes(decryptedBytes)
		if(key.substring(0,8) != author_id.substring(0,8) && key.substring(8,16) != guild_id.substring(0,8)){
			l.send('errors.wrong_password')
			return false
		}
		return true
	}
	async run(msg: Message,l: Lang, args: string[]): Promise<void> {
		if(!msg.guild) return
		const aesCbc = new ModeOfOperation.cbc(GetPassCommand.key, GetPassCommand.iv)
		if (args.length == 0) {
			const id1 = msg.author.id.substring(0,8)
            const id2 = msg.guild.id.substring(0,8)
			const textBytes = utils.utf8.toBytes(id1 + id2);
			const encryptedBytes = aesCbc.encrypt(textBytes);
			const encryptedHex = utils.hex.fromBytes(encryptedBytes)
			msg.author.send(await l.translate('info.getpass.own'))
			msg.author.send(encryptedHex)
		} else {
			const user = UserFinder.getUser(msg,args[0])
			if (!user) {
				l.reply('errors.invalid_user',args[0])
				return
			}
			const id1 = user.id.substring(0,8)
            const id2 = msg.guild.id.substring(0,8)
			const textBytes = utils.utf8.toBytes(id1 + id2)
			const encryptedBytes = aesCbc.encrypt(textBytes);
			const encryptedHex = utils.hex.fromBytes(encryptedBytes)
			msg.author.send(await l.translate('info.getpass.user',user.id,user.tag)).catch((e)=>{
			if (e.code == 50007) l.reply('errors.dm_closed')
			else l.reply('errors.unknown')
			})
			msg.author.send(encryptedHex)
		}

	}
	async checkPermissions(msg: Message, l: Lang, prefix: string): Promise<boolean> {
		if(!msg.guild) return false
		const mod = MemberFinder.getMember(msg.guild, msg.author.id)
		if(!mod) return false
		if (!mod.permissions.has(8n)) {
			l.reply('info.getpass.no_admin', prefix, mod.toString())
			return false
		}
		return true
	}
}