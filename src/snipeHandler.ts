/// <reference path="../node_modules/@types/mysql/index.d.ts"/>
import * as MySQL from "mysql"
import {Message, PartialMessage} from 'discord.js'
import { Connection } from "mysql";
export default class SnipeHandler {
  
  private connection: Connection
  constructor(){
    const connection = MySQL.createConnection(process.env.JAWSDB_MARIA_URL!);

    connection.connect();
    this.connection = connection
    this.test()
  }
  saveMessage(msg: Message| PartialMessage):void{
    
  }
  test() {
    this.connection.query('SELECT 1 + 1 AS solution', function(err: any, rows: { solution: any; }[], fields: any) {
      if (err) throw err;

      console.log('The solution is: ', rows[0].solution);
    });

    this.connection.end();
  }
}