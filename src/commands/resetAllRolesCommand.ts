import ArgCommand from "./commandArgInterface";
import { Message, Permissions,Collection, Role} from "discord.js";
import { utils, ModeOfOperation } from "aes-js";
import { GetPassCommand } from ".";
import console from "console";

export class ResetAllRolesCommand implements ArgCommand {
	requiredArgs: number = 1
	commandNames: string[] = ['resetallroles']
	guildExclusive: boolean = true
	shortdescription: string = 'Reinicia todos los roles.'
	fulldescription: string = 'Reinicia los permisos de todos los roles del servidor (a los que tengo acceso), en caso de que no quieras dejarlos en 0 también puedes incluir [la suma](https://calcuonline.com/calculadoras/calculadora-hexadecimal/#suma-hexadecimal) de [los permisos](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags) que van a tener esos roles. Requiere contraseña obtenida con el comando `getPass`.'
	usage: string = '<contraseña> [permisos]'
	examples: string[] = ['832abc370fa879d2']
	permission: string = 'Gestionar roles'
	async run(msg: Message, args: string[]): Promise<void> {
		const encryptedBytes = utils.hex.toBytes(args[0])
		const aesCbc = new ModeOfOperation.cbc(GetPassCommand.key,GetPassCommand.iv)
		const decryptedBytes = aesCbc.decrypt(encryptedBytes)
		const key = utils.utf8.fromBytes(decryptedBytes)
		if(key != msg.author.id.substring(0,16)){
			msg.reply('Contraseña incorrecta.')
			return
		}
		var perms = 0
		if (args[1]) {
			perms = parseInt(args[1],16)
			if(isNaN(perms)){
				msg.reply(`${args[1]} no es un número válido.`)
				await msg.channel.send('Cancelando comando...').then(m=>m.delete({timeout: 1000}))
				msg.channel.send('Comando cancelado.')
				return
			}
		}
		const bot = msg.guild!.member(msg.client.user!)!
		const botperms = bot.permissions.bitfield
		if (!bot.hasPermission(8) && perms > botperms) {
			msg.reply(`no puedo añadir los permisos \`${new Permissions(perms - botperms).toArray()}\``)
			await msg.channel.send('Cancelando comando...').then(m=>m.delete({timeout: 1000}))
			msg.channel.send('Comando cancelado.')
			return
		}
		const botposition = bot.roles.highest.position
		await msg.channel.send(`Reiniciando ${botposition - 1} roles con los permisos \`${new Permissions(perms).toArray()}\``)
		msg.guild!.roles.cache.forEach(async r => {
		})
		const asyncForEach = async (array:Role[], callback: { (r: Role): Promise<void>; (arg0: Role, arg1: number, arg2: Role[]): any; }) => {
		  for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array)
		  }
		}
		const restart = async () => {
		  await asyncForEach(msg.guild!.roles.cache.array(), async (r:Role) => {
			if (botposition > r.position) await r.setPermissions(perms,`Comando ejecutado por ${msg.author.tag}`)
				.catch(e=>{
					msg.channel.send(`Fallo al reiniciar **${r.name}**\nOmitiendo...`)
					console.error(e.stack)
				});
			});
		  msg.channel.send('Todos los roles reiniciados.')
		}
		restart()
	}
	async checkPermissions(msg: Message): Promise<boolean> {
		const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!mod.hasPermission(Permissions.FLAGS.MANAGE_ROLES)){
			msg.reply('no tienes permiso para reiniciar los roles.')
			return false
		}
		if (!bot.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
			msg.reply('no tengo permiso para reiniciar los roles.')
			return false
		}
		return true
	}
	
}
  