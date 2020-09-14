import {Message, User, UserFlags, PartialMessage} from 'discord.js'
import { RowDataPacket } from 'mysql2';
import { Connections } from "./config/connections";
export default class SnipeHandler {
  
  async saveDeletedMessage(msg: Message | PartialMessage):Promise<void>{
    const author = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:null,flags: new UserFlags(0),system:false});
    const g = msg.guild
    if(!g) return
    const content = msg.content
    if(!content) return
    const files = msg.attachments.array()
    var image:string | null = null
    if(files.length > 0){
      const file = files[0]
      if(file.name){
        const n = file.name
        if(!(n.endsWith('.mp4') || n.endsWith('.mov') || n.endsWith('.yiff')) && file.width) image = file.url
        else console.log(`El archivo ${file.url} no era una imagen`)
      }
    } 
    const [rows] = await Connections.db.execute<RowDataPacket[]>('INSERT INTO deleted VALUES (?, ?, ?, ?, ?, ?, ?, ?)',[content,image, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
      console.log('Mensaje guardado: ' + rows[0])
  }
  async saveEditedMessage(msg:Message | PartialMessage):Promise<void>{
    const author = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:null,flags: new UserFlags(0),system:false});
    const g = msg.guild
    if(!g) return
    const content = msg.content
    if(!content) return
    const [rows] = await Connections.db.execute<RowDataPacket[]>('INSERT INTO edited VALUES (?, ?, ?, ?, ?, ?, ?)',[content, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp])
      console.log(`Mensaje editado guardado: ${rows[0]}`)
  }
}