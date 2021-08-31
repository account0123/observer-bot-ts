import MySQL, { Connection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: ".env" })

export class Connections {
	static db: Connection
  constructor(){
    this.connect()
  }
  private async connect(){
    const database_url = process.env.JAWSDB_MARIA_URL
    if(!database_url) throw new Error('Database URL is undefined')
    await MySQL.createConnection(database_url).then((c)=>{
      Connections.db = c
      console.log('Database conectada')
    }).catch(()=>console.error('Database no pudo ser conectada'))
  }
}