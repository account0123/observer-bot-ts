/// <reference path="../node_modules/@types/mysql/index.d.ts" />
import * as MySQL from "mysql"
import {Message, PartialMessage, User, UserFlags} from 'discord.js'
import { Connection } from "mysql";
export default class SnipeHandler {
  
  private connection: Connection
  constructor(){
    const connection = MySQL.createConnection(process.env.JAWSDB_MARIA_URL!);

    connection.connect();
    this.connection = connection
  }
  saveMessage(msg: Message| PartialMessage):void{
    const author = msg.author || new User(msg.client,{username: 'Unknown',discriminator:'0000',id:'123456789987654321',locale:'es',bot:false,avatar:null,flags: new UserFlags(0),system:false});
    const content = msg.content
    if(!content) return
    const g = msg.guild
    if(!g) return
    const c = msg.channel
    const time = msg.createdTimestamp
    this.connection.query('CREATE TABLE deleted(content varchar(2000),username varchar(32),discriminator varchar(4))', function(err: any, rows: { content:string,username:string,discriminator:string }[], fields: any) {
      if (err) throw err;
      console.log('Mensaje guardado')
    });
  }
}