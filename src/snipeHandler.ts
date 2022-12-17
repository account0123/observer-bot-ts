import {Message, PartialMessage} from 'discord.js'
import { Lang } from './commands/lang/Lang';
import { Connections } from "./config/connections";
import { Logger } from './models/Loggers';

export default class SnipeHandler {
  
  async saveDeletedMessage(msg: Message | PartialMessage):Promise<void>{
    if(msg.webhookId) return
    const author = msg.author
    if(!author) return
    const g = msg.guild
    if(!g) return
    const content = msg.content
    if(!content) return   
    Logger.logDeleted(msg, g.id, new Lang(<Message>msg))
    Connections.db.execute('INSERT INTO deleted VALUES (?, ?, ?, ?, ?, ?, ?)',[content, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
    console.log('Mensaje borrado guardado')
  }
  
  async saveEditedMessage(msg:Message | PartialMessage, u: Message | PartialMessage):Promise<void>{

    if(msg.webhookId) return
    if(msg.content == u.content) return
    const author = msg.author
    if(!author) return
    const g = msg.guild
    if(!g) return
    const content = msg.content
    if(!content) return
    Logger.logEdited(msg, u, g.id, new Lang(<Message>msg))
    Connections.db.execute('INSERT INTO edited VALUES (?, ?, ?, ?, ?, ?, ?)',[content, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
    console.log('Mensaje editado guardado')
  }
}