import {Message, PartialMessage} from 'discord.js'
import { Lang } from './commands/lang/Lang';
import { Connections } from "./config/connections";
import { Logger } from './models/Loggers';

export default class SnipeHandler {
  
  async saveDeletedMessage(msg: Message | PartialMessage):Promise<void>{
    if(msg.webhookId || !msg.author || !msg.guild || !msg.content) return
    const author = msg.author
    Logger.logDeleted(msg, msg.guild.id, new Lang(<Message>msg))
    Connections.db.execute('INSERT INTO deleted VALUES (?, ?, ?, ?, ?, ?, ?)',[msg.content, author.username, author.discriminator, author.avatarURL({forceStatic: false}), msg.guild.id, msg.channel.id,msg.createdTimestamp])
    console.log('Mensaje borrado guardado')
  }
  
  async saveEditedMessage(msg:Message | PartialMessage, u: Message | PartialMessage):Promise<void>{

    if(msg.webhookId || !msg.content || !msg.author || !msg.guild) return
    if(msg.content == u.content) return
    const author = msg.author
    const g = msg.guild
    Logger.logEdited(msg, u, g.id, new Lang(<Message>msg))
    Connections.db.execute('INSERT INTO edited VALUES (?, ?, ?, ?, ?, ?, ?)',[msg.content, author.username, author.discriminator, author.avatarURL({forceStatic: false}), g.id, msg.channel.id,msg.createdTimestamp])
    console.log('Mensaje editado guardado')
  }
}