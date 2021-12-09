import {Message, User, UserFlags, PartialMessage} from 'discord.js'
import { Lang } from './commands/lang/Lang';
import { Connections } from "./config/connections";
import { Logger } from './models/Loggers';

export default class SnipeHandler {
  
  async saveDeletedMessage(msg: Message | PartialMessage):Promise<void>{
    if(msg.webhookID) return
    const author = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:'https://cdn.discordapp.com/attachments/697873617945493565/748390370496479352/black.png',flags: new UserFlags(0),system:false});
    const g = msg.guild
    if(!g) return
    const content = msg.content
    if(!content) return
    
    Logger.logDeleted(msg, g.id, new Lang(msg))
    Connections.db.execute('INSERT INTO deleted VALUES (?, ?, ?, ?, ?, ?, ?, ?)',[content,null, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
    console.log('Mensaje borrado guardado')
  }
  
  async saveEditedMessage(msg:Message | PartialMessage, u: Message | PartialMessage):Promise<void>{
    if(msg.webhookID) return
    if(msg.content == u.content) return
    const author = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:null,flags: new UserFlags(0),system:false});
    const g = msg.guild
    if(!g) return
    const content = msg.content
    if(!content) return

    Logger.logEdited(msg, u, g.id, new Lang(msg))
    Connections.db.execute('INSERT INTO edited VALUES (?, ?, ?, ?, ?, ?, ?)',[content, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
    console.log('Mensaje editado guardado')
  }
}