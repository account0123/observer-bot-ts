import MySQL, { Connection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: ".env" })

export class Connections {
	static db: Connection
  constructor(){
    this.connect()
  }
  private async connect(){
    const database_url = process.env.DATABASE_URL
    if(!database_url) throw new Error('Database URL is undefined')

    if(database_url.startsWith('mysql')){
      const reg = /mysql:\/\/(.+):(.+)@([0-9.]+):(\d+)\/(.+)/
      const data = database_url.match(reg)
      if (!data || data.length < 6) throw new Error('DATABASE URL NO ES VALIDO/NO ES SQL')
      MySQL.createConnection({
        user: data[1],
        password: data[2],
        host: data[3],
        port: +data[4],
        database: data[5]
      }).then((c)=>{
        Connections.db = c
        console.log('Database conectada')
      }).catch((e)=>{
        console.error(e)
        console.error('Database no pudo ser conectada')
      })
    }
  }
}