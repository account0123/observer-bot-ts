import Command from "./commandInterface"
import { Message, Permissions } from "discord.js"
import { Connections } from "../config/connections"
import { Lang } from "./lang/Lang"
import { FormatCommand } from "./formatCommand"

export class StopCommand implements Command {
  type: string | undefined
  shortdescription = 'info.stop.description'
  fulldescription: string = this.shortdescription
  guildExclusive = false
  commandNames = ["stop","off","shutdown"]
  async run(message: Message, l :Lang): Promise<void> {
    if(message.author.id != '283763804993486849'){
      l.reply('info.stop.error')
      return
    } 
    Connections.db.end()
    console.log('Connection closed!')
    if(!FormatCommand.webhooks){
      shutdown(message)
      return
    }
    for (const wh of FormatCommand.webhooks.values()) {
      const guild = message.client.guilds.resolve(wh.guildID)
      if(guild){
        if(!message.client.user) return
        const bot = guild.member(message.client.user)
        if(bot){
          if(bot.hasPermission(Permissions.FLAGS.MANAGE_WEBHOOKS)){
            wh.delete('Bot is shutting down').then(()=>console.log(`Webhook ${wh.id} from the channel ${wh.channelID} from the guild ${wh.guildID} has been deleted!`)).catch((err)=>console.error(err.stack));
          }
        }
      }
    }
    FormatCommand.webhooks.clear()
    shutdown(message)
    }
}

function shutdown(msg: Message){
  msg.channel.send('`Deteniendo...`').then( message => {
    message.client.destroy()
    process.exit(0)
  });  
}