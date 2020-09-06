import Command from "./commandInterface"
import { Message } from "discord.js"
import { Connections } from "../config/connections"

export class StopCommand implements Command {
  shortdescription: string = 'info.stop.description'
  fulldescription: string = this.shortdescription
  guildExclusive: boolean = false
  commandNames = ["stop","off","shutdown"]
  async run(message: Message): Promise<void> {
    if(message.author.id != '283763804993486849') message.reply('Solo el creador puede usar ese comando')
    Connections.db.end()
    await message.channel.send('`Deteniendo...`').then( msg => msg.client.destroy());  
    }
}