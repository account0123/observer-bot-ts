<<<<<<< Updated upstream
import {Message, User, UserFlags, PartialMessage} from 'discord.js'
import { RowDataPacket } from 'mysql2';
=======
import {Message, PartialMessage} from 'discord.js'
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    const files = msg.attachments.array()
    let image:string | null = null
    if(files.length > 0){
      const file = files[0]
      if(file.name){
        const n = file.name
        if(!(n.endsWith('.mp4') || n.endsWith('.mov') || n.endsWith('.yiff')) && file.width) image = file.url
        else console.log(`El archivo ${file.url} no era una imagen`)
      }
    }
    Logger.logDeleted(msg, g.id, new Lang(msg))
    const [rows, fields] = await Connections.db.execute<RowDataPacket[]>('INSERT INTO deleted VALUES (?, ?, ?, ?, ?, ?, ?, ?)',[content,image, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
    console.log('Filas: ' + JSON.stringify(rows))
    console.log('Fields:' + fields)
=======
    
    Logger.logDeleted(msg, g.id, new Lang(<Message>msg))
    Connections.db.execute('INSERT INTO deleted VALUES (?, ?, ?, ?, ?, ?, ?, ?)',[content,null, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
    console.log('Mensaje borrado guardado')
>>>>>>> Stashed changes
  }
  async saveEditedMessage(msg:Message | PartialMessage, u: Message | PartialMessage):Promise<void>{
<<<<<<< Updated upstream
    if(msg.webhookID) return
    const author = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:null,flags: new UserFlags(0),system:false});
=======
    if(msg.webhookId) return
    if(msg.content == u.content) return
    const author = msg.author
    if(!author) return
>>>>>>> Stashed changes
    const g = msg.guild
    if(!g) return
    const content = msg.content
    if(!content) return
<<<<<<< Updated upstream
    Logger.logEdited(msg, u, g.id, new Lang(msg))
    const [rows, fields] = await Connections.db.execute<RowDataPacket[]>('INSERT INTO edited VALUES (?, ?, ?, ?, ?, ?, ?)',[content, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
      console.log(`Filas: ${JSON.stringify(rows)}`)
      console.log('Fields: ' + fields)
=======

    Logger.logEdited(msg, u, g.id, new Lang(<Message>msg))
    Connections.db.execute('INSERT INTO edited VALUES (?, ?, ?, ?, ?, ?, ?)',[content, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
    console.log('Mensaje editado guardado')
>>>>>>> Stashed changes
  }
}