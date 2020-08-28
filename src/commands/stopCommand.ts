import Command from "./commandInterface"
import { Message } from "discord.js"

export class StopCommand implements Command {
  guildExclusive: boolean = false
  commandNames = ["stop","off","shutdown"]

  help(): string {
    return 'El bot se desconecta'
  }

  async run(message: Message): Promise<void> {
    if(message.author.id != '283763804993486849') message.reply('Solo el creador puede usar ese comando')
    await message.channel.send('`Deteniendo...`').then( msg => msg.client.destroy());  
    }
}