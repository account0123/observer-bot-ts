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
			l.reply('errors.botperms.unban')
			return false
		}
		if (!mod.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
			l.reply('errors.modperms.unban')
			return false
		}
		return true
  }
  shortdescription: string = 'info.unban.description'
  fulldescription: string = this.shortdescription
  guildExclusive: boolean = true
  commandNames = ["unban"]
  lang!: Lang
  async run(msg: Message, l:Lang, args: string[]): Promise <void> {
    this.lang = l
    const g = msg.guild!
    const manager = g.members
    if (args[0] == 'everyone') {
      const encryptedBytes = utils.hex.toBytes(args[1])
      const decryptedBytes = new ModeOfOperation.cbc(GetPassCommand.key,GetPassCommand.iv).decrypt(encryptedBytes)
		  if(utils.utf8.fromBytes(decryptedBytes) != msg.author.id.substring(0,16)){
			  l.reply('errors.wrong_password')
			  return
		  }
      this.unbaneveryone(g,manager,msg)
      return
    }
    const id = args.shift()
    if(!id) return
    const reason = args.join(' ') || 'reason'
    await manager.unban(id,reason).then(u=>l.send('info.unban.success',u.tag,g.name)).catch(e=>{
      l.send('info.unban.error',id)
      if (e.code == 10013) l.send('info.unban.10013')
      if (e.code == 10026) l.send('info.unban.10026')
      else {
        l.reply('errors.unknown')
        console.error('No se pudo desbanear a {id} por el siguiente error {e}')
    }
    });
  }
  private async unbaneveryone(g:Guild,manager:GuildMemberManager, msg:Message) {
    var count = 0
    var errors = 0
    this.lang.send('info.unban.start')
    await g.fetchBans().then(banCollection=>{
      banCollection.each(async banInfo=>{
       const user = banInfo.user
       await manager.unban(user,this.lang.translate('reason',msg.author.tag)).then(()=>count++).catch(e=>{
         errors++
         this.lang.send('info.unban.massunban-error',user.tag)
         console.error(`Se intentó desbanear a ${user.tag} pero ocurrió el siguiente error.`)
         console.error(e.stack)
       });
      });
    });
    this.lang.send('info.unban.massunban-success','' + count)
    if(count == 0 && errors > 5){
      this.lang.send('errors.no_hit')
      // Ejecuta !!clean <cantidad de miembros>
      new CleanCommand().run(msg,this.lang,[`${errors}`])
      // Si falla en eso dice....
      .catch(()=>this.lang.send('errors.clean_up_failed'));
    }
  }

}