import {Message, User, UserFlags, PartialMessage} from 'discord.js'
import { Connections } from "./config/connections";
export default class SnipeHandler {
  
  saveDeletedMessage(msg: Message | PartialMessage):void{
    const author = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:null,flags: new UserFlags(0),system:false});
    const g = msg.guild
    if(!g) return
    const content = msg.content
    if(!content) return
    Connections.db.query('INSERT INTO deleted VALUES (?, ?, ?, ?, ?, ?, ?)',[content, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp], function(err: any, rows: { content:string,username:string,discriminator:string, avatar_url: string,guild:string, channel:string,time:number}[], fields: any) {
      if (err) throw err;
      const row = rows[0]
      console.log(`Mensaje guardado: ${row.username}#${row.discriminator} borró un mensaje que decía "${row.content}" en el canal '${row.channel}' del servidor '${row.guild}'`)
    });
  }
  saveEditedMessage(msg:Message | PartialMessage):void{
    const author = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:null,flags: new UserFlags(0),system:false});
    const g = msg.guild
    if(!g) return
    const content = msg.content
    if(!content) return
    Connections.db.query('INSERT INTO edited VALUES (?, ?, ?, ?, ?, ?, ?)',[content, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,msg.createdTimestamp], function(err: any, row: { content:string,username:string,discriminator:string, avatar_url: string,guild:string, channel:string,time:number}, fields: any) {
      if (err) throw err;
      console.log(`Mensaje editado guardado`)
    });
  }
}