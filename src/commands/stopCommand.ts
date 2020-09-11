import Command from "./commandInterface"
import { Message } from "discord.js"
import { Connections } from "../config/connections"
import { Lang } from "./lang/Lang"

export class StopCommand implements Command {
  shortdescription: string = 'info.stop.description'
  fulldescription: string = this.shortdescription
  guildExclusive: boolean = false
  commandNames = ["stop","off","shutdown"]
  async run(message: Message, l :Lang): Promise<void> {
    if(message.author.id != '283763804993486849') l.reply('info.stop.error')
    Connections.db.end()
    await message.channel.send('`Deteniendo...`').then( msg => msg.client.destroy());  
    }
}