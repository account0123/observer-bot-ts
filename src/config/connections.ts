import MySQL, { Connection } from "mysql2/promise";
import { Client } from "discord.js";

export class Connections {
	static db: Connection
  constructor(client:Client){
  this.connect()
  }
  private async connect(){
    await MySQL.createConnection(process.env.JAWSDB_MARIA_URL!).then((c)=>{
      Connections.db = c
      console.log('Database conectada')
    }).catch(()=>console.error('Database no pudo ser conectada'))
  }
}