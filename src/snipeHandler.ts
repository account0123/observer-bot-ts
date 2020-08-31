/// <reference path="../node_modules/@types/mysql/index.d.ts" />
import * as MySQL from "mysql"
import {Message, PartialMessage, User, UserFlags} from 'discord.js'
import { Connection } from "mysql";
export default class SnipeHandler {
  
  static connection: Connection
  constructor(){
    const connection = MySQL.createConnection(process.env.JAWSDB_MARIA_URL!)
    connection.connect();
    SnipeHandler.connection = connection
  }
  saveMessage(msg: Message| PartialMessage):void{
    const author = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:null,flags: new UserFlags(0),system:false});
    const content = msg.content
    if(!content) return
    const g = msg.guild
    if(!g) return
    const time = msg.createdTimestamp
    SnipeHandler.connection.query('INSERT INTO deleted VALUES (?, ?, ?, ?, ?, ?, ?)',[content, author.username, author.discriminator, author.avatarURL({dynamic:true}), g.id, msg.channel.id,time], function(err: any, row: { content:string,username:string,discriminator:string, avatar_url: string,guild:string, channel:string,time:number}, fields: any) {
      if (err) throw err;
      console.log(`Mensaje guardado: ${row.username}#${row.discriminator} borró un mensaje que decía "${row.content}" en el canal '${row.channel}' del servidor '${row.guild}'`)
    });
  }
}