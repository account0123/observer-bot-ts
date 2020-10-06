import Command from "./commandInterface"
import { Message, Permissions } from "discord.js"
import { Connections } from "../config/connections"
import { Lang } from "./lang/Lang"
import { FormatCommand } from "./formatCommand"

export class StopCommand implements Command {
  shortdescription: string = 'info.stop.description'
  fulldescription: string = this.shortdescription
  guildExclusive: boolean = false
  commandNames = ["stop","off","shutdown"]
  async run(message: Message, l :Lang): Promise<void> {
    if(message.author.id != '283763804993486849'){
      l.reply('info.stop.error')
      return
    } 
    Connections.db.end()
    for (const wh of FormatCommand.webhooks.values()) {
      const guild = message.client.guilds.resolve(wh.guildID)
      if(guild){
        const bot = guild.member(message.client.user!)
        if(bot){
          if(bot.hasPermission(Permissions.FLAGS.MANAGE_WEBHOOKS)){
            wh.delete('Bot is shutting down').then(()=>console.log(`Webhook ${wh.id} from the channel ${wh.channelID} from the guild ${wh.guildID} has been deleted!`)).catch((err)=>console.error(err.stack));
          }
        }
      }
    }
    FormatCommand.webhooks.clear()
    await message.channel.send('`Deteniendo...`').then( msg => msg.client.destroy());  
    }
}