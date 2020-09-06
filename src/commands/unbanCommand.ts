import { Message, Guild, GuildMemberManager, Permissions} from "discord.js"
import ArgCommand from "./commandArgInterface"
import { Lang } from "./lang/Lang"
import { utils, ModeOfOperation } from "aes-js"
import { GetPassCommand, CleanCommand } from "."
export class UnbanCommand implements ArgCommand {
  requiredArgs: number = 1
  usage: string = 'info.unban.usage'
  examples: string[] = ['123456789987654321 ban expired']
  permission: string = 'BAN_MEMBERS'
  async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
    const mod = msg.guild!.member(msg.author)!
		const bot = msg.guild!.member(msg.client.user!)!
		if (!bot.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			l.reply('errors.botperms.unban',msg)
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			l.reply('errors.modperms.unban',msg)
			return false
		}
		return true
  }
  shortdescription: string = 'info.unban.description'
  fulldescription: string = this.shortdescription
  guildExclusive: boolean = true
  commandNames = ["unban"]
  async run(msg: Message, args: string[]): Promise <void> {
    const g = msg.guild!
    const manager = g.members
    if (args[0] == 'everyone') {
      const encryptedBytes = utils.hex.toBytes(args[1])
      const decryptedBytes = new ModeOfOperation.cbc(GetPassCommand.key,GetPassCommand.iv).decrypt(encryptedBytes)
		  if(utils.utf8.fromBytes(decryptedBytes) != msg.author.id.substring(0,16)){
			  msg.reply('Contraseña incorrecta.')
			  return
		  }
      this.unbaneveryone(g,manager,msg)
      return
    }
    const id = args.shift()
    if(!id) return
    const reason = args.join(' ') || 'reason'
    await manager.unban(id,reason).then(u=>msg.channel.send(`**${u.username}** está desbaneado de **${g.name}**.`)).catch(e=>{
      if (e.code == 10013) msg.channel.send('Error 10013: No fue encontrado el usuario asociado a la susodicha ID.')
      if (e.code == 10026) msg.channel.send('Error 10026: El usuario no estaba baneado en primer lugar.')
      else {
        msg.channel.send('error desconocido')
        console.error('No se pudo desbanear a {id} por el siguiente error {e}')
    }
    });
  }
  private async unbaneveryone(g:Guild,manager:GuildMemberManager,msg:Message) {
    var count = 0
    var errors = 0
    msg.channel.send('Iniciando desbaneo masivo, pero los invitas vos eh?')
    await g.fetchBans().then(banCollection=>{
      banCollection.each(async banInfo=>{
       const user = banInfo.user
       await manager.unban(user,'comando activado').then(()=>count++).catch(e=>{
         errors++
         msg.channel.send(`Error al desbanear a ${user.tag}`)
         console.error(`Se intentó desbanear a ${user.tag} pero ocurrió el siguiente error.`)
         console.error(e.stack)
       });
      });
    });
    msg.channel.send(`${count} miembros desbaneados.`)
    if(count == 0 && errors > 5){
      msg.channel.send('Vaya, 0 miembros... mejor limpio')
      // Ejecuta !!clean <cantidad de miembros>
      new CleanCommand().run(msg,[`${errors}`])
      // Si falla en eso dice....
      .catch(()=>msg.channel.send('Lo siento... creo que tampoco pude limpiar este desastre. Mejor usa a Chocolat o algún bot de esos.'));
    }
  }

}