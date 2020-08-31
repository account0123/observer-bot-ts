import { Message } from "discord.js";
import {utils, ModeOfOperation} from 'aes-js'
import ArgCommand from "./commandArgInterface";
import CommandHandler from "../commandHandler";
import { UserFinder } from "../util/UserFinder";
export class GetPassCommand implements ArgCommand {
	permission: string = 'Administrador'
	requiredArgs: number = 0
	usage: string = '[usuario]'
	examples: string[] = ['','123456789987654321', '@usuario#1234']
	commandNames: string[] = ['getpass', 'getpassword','getsecret']
	guildExclusive: boolean = false
	shortdescription: string = 'Crea una clave de seguridad.'
	fulldescription: string = 'Crea una clave de seguridad personal para utilizar ciertos comandos administrativos.'
	static readonly key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]
	static readonly iv = [ 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,115, 116 ]
	async run(msg: Message, args: string[]): Promise<void> {
		const aesCbc = new ModeOfOperation.cbc(GetPassCommand.key, GetPassCommand.iv)
		if (args.length == 0) {
			const id = msg.author.id.substring(0,16)
			const textBytes = utils.utf8.toBytes(id);
			const encryptedBytes = aesCbc.encrypt(textBytes);
			const encryptedHex = utils.hex.fromBytes(encryptedBytes)
			msg.author.send('Tu clave para usar ciertos comandos es:')
			msg.author.send(encryptedHex)
		} else {
			const user = UserFinder.getUser(msg,args[0])
			if (!user) {
				msg.reply('el usuario ingresado no es válido')
				return
			}
			const id = user.id.substring(0,16)
			const textBytes = utils.utf8.toBytes(id);
			const encryptedBytes = aesCbc.encrypt(textBytes);
			const encryptedHex = utils.hex.fromBytes(encryptedBytes)
			msg.author.send(`La clave de \`${user.id}\` (${user.tag}) para usar ciertos comandos es:`)
			msg.author.send(encryptedHex)
		}

	}
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		if (!mod.hasPermission(8)) {
			msg.reply(`no tienes el permiso de administrador, pídele a un administrador que te cree la clave con ${CommandHandler.prefix}getpass \`@tu usuario\``)
			return false
		}
		return true
	}
}