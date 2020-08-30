import Command from "./commandInterface"
import { Message } from "discord.js"

export class StopCommand implements Command {
  shortdescription: string = 'Me apago. *Uso exclusivo de mi creador*.'
  fulldescription: string = this.shortdescription
  guildExclusive: boolean = false
  commandNames = ["stop","off","shutdown"]
  async run(message: Message): Promise<void> {
    if(message.author.id != '283763804993486849') message.reply('Solo el creador puede usar ese comando')
    await message.channel.send('`Deteniendo...`').then( msg => msg.client.destroy());  
    }
}