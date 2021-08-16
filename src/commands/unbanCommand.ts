import { Message, Guild, GuildMemberManager, Permissions} from "discord.js"
import ArgCommand from "./commandArgInterface"
import { Lang } from "./lang/Lang"
import { GetPassCommand } from "."

export class UnbanCommand implements ArgCommand {
  requiredArgs = 1
  usage = 'info.unban.usage'
  examples: string[] = ['123456789987654321 ban expired']
  permission = 'BAN_MEMBERS'
  type = 'mod'
  private static locked_guilds: string[] = []
  async checkPermissions(msg: Message, l: Lang): Promise<boolean> {
    if(!msg.guild || !msg.client.user) return false
		const mod = msg.guild.member(msg.author)
		const bot = msg.guild.member(msg.client.user)
		if(!mod || !bot) return false
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
  shortdescription = 'info.unban.description'
  fulldescription: string = this.shortdescription
  guildExclusive = true
  commandNames = ["unban"]
  lang!: Lang
  async run(msg: Message, l:Lang, args: string[]): Promise <void> {
    this.lang = l
    const g = msg.guild
    if(!g) return
    const manager = g.members
    if (args[0] == 'everyone') {
      if(UnbanCommand.locked_guilds.includes(g.id)){
          l.send('running')
          return
      }
      if(!GetPassCommand.validatePassword(msg.author.id, g.id, l, args.shift() || '')) return
      this.unbaneveryone(g,manager,msg)
      return
    }
    const id = args.shift()
    if(!id) return
    const reason = args.join(' ') || await l.translate('reason',msg.author.tag)
    await manager.unban(id,reason).then(u=>l.send('info.unban.success',u.tag,g.name)).catch(e=>{
      l.send('info.unban.error',id)
      if (e.code == 10013) l.send('info.unban.10013')
      if (e.code == 10026) l.send('info.unban.10026')
      else {
        l.reply('errors.unknown')
        console.error(`No se pudo desbanear a ${id} por el siguiente error ${e}`)
    }
    });
  }
  private async unbaneveryone(g:Guild,manager:GuildMemberManager, msg:Message) {
    let count = 0
    this.lang.send('info.unban.start')
    UnbanCommand.locked_guilds.push(g.id)
    await g.fetchBans().then(banCollection=>{
      banCollection.each(async banInfo=>{
       const user = banInfo.user
       await new Promise<void>((res)=>setTimeout(()=>res(), 500))
       await manager.unban(user,await this.lang.translate('reason',msg.author.tag)).then(()=>count++).catch(e=>{
         this.lang.send('info.unban.massunban-error',user.tag)
         console.error(`Se intentó desbanear a ${user.tag} pero ocurrió el siguiente error.`)
         console.error(e.stack)
       });
      });
    });
    UnbanCommand.locked_guilds.splice(UnbanCommand.locked_guilds.indexOf(g.id), 1)
    this.lang.send('info.unban.massunban-success','' + count)
  }

}